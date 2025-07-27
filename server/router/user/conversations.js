const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

// get all convos for user, sorted by last_message desc
router.get('/', authorize, async (req, res) => {
  const userId = req.user.user_id;
  const result = await pool.query(
    `SELECT 
       c.*, p.title AS product_title,r.title AS request_title,
       u1.name AS buyer_name,
       u2.name AS seller_name,
       /* count unread msgs not sent by me */
       (SELECT COUNT(*) FROM "Message" m
         WHERE m.conversation_id=c.conversation_id
           AND m.sender_id<>$1
           AND m.is_read=false
       ) AS unread_count
     FROM "Conversation" c
     JOIN "User" u1 ON c.buyer_id=u1.user_id
     JOIN "User" u2 ON c.seller_id=u2.user_id
     LEFT JOIN "Product" p ON c.product_id=p.product_id
     LEFT JOIN "ProductRequest" r ON c.request_id=r.request_id
     WHERE c.buyer_id=$1 OR c.seller_id=$1
     ORDER BY c.last_message DESC`,
    [userId]
  );
  res.json(result.rows);
});

// create or return existing product convo
router.post('/', authorize, async (req, res) => {
  const { product_id, request_id, seller_id, buyer_id } = req.body;
  // const buyer_id = req.user.user_id;
  // find existing
  if(!product_id && !request_id) {
    return res.status(400).json({ error: 'Product ID or Request ID is required' });
  }
  if(product_id) {
    let conv = await pool.query(
      `SELECT * FROM "Conversation"
      WHERE buyer_id=$1 AND seller_id=$2 AND product_id=$3`,
      [buyer_id, seller_id, product_id]
    );
    if (conv.rows.length) return res.json(conv.rows[0]);
    // create new
    const ins = await pool.query(
      `INSERT INTO "Conversation"(buyer_id,seller_id,product_id,status)
      VALUES($1,$2,$3,'open') RETURNING *`,
      [buyer_id, seller_id, product_id]
    );
    res.status(201).json(ins.rows[0]);
  }
  if(request_id) {
    console.log(buyer_id, seller_id, request_id);
    let conv = await pool.query(
      `SELECT * FROM "Conversation"
      WHERE buyer_id=$1 AND seller_id=$2 AND request_id=$3`,
      [buyer_id, seller_id, request_id]
    );
    if (conv.rows.length) return res.json(conv.rows[0]);
    // create new
    const ins = await pool.query(
      `INSERT INTO "Conversation"(buyer_id,seller_id,request_id,status)
      VALUES($1,$2,$3,'open') RETURNING *`,
      [buyer_id, seller_id, request_id]
    );
    res.status(201).json(ins.rows[0]);
  }
});

// get paged messages
router.get('/:id/messages', authorize, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  // mark all unread incoming msgs as read
  await pool.query(
    `UPDATE "Message"
     SET is_read = true
     WHERE conversation_id=$1
       AND sender_id<>$2
       AND is_read=false`,
    [id, userId]
  );

  const { page = 1, limit = 20 } = req.query;
  const offset = (page-1)*limit;
  const result = await pool.query(
    `SELECT m.*, u.name AS sender_name
     FROM "Message" m
     JOIN "User" u ON m.sender_id=u.user_id
     WHERE m.conversation_id=$1
     ORDER BY m.timestamp DESC
     LIMIT $2 OFFSET $3`,
    [id, limit, offset]
  );
  res.json(result.rows.reverse());
});

// post a new message
router.post('/:id/messages', authorize, async (req, res) => {
  const conversation_id = req.params.id;
  const sender_id = req.user.user_id;
  const { content } = req.body;
  const timestamp = new Date();
  const ins = await pool.query(
    `INSERT INTO "Message"(conversation_id,sender_id,content,timestamp)
     VALUES($1,$2,$3,$4) RETURNING *`,
    [conversation_id, sender_id, content, timestamp]
  );
  // update last_message
  await pool.query(
    `UPDATE "Conversation" SET last_message=$1 WHERE conversation_id=$2`,
    [timestamp, conversation_id]
  );
  const m = ins.rows[0];
  // emit via socket
  req.app.get('io').to(`conv_${conversation_id}`)
    .emit('newMessage', { ...m, sender_name: req.user.name });
  res.status(201).json(m);
});


// mark sold (seller only)
router.put('/:id/sold', authorize, async (req, res) => {
  const conversation_id = req.params.id;
  const { quantity, selling_price } = req.body;
  const data = await pool.query(
    `SELECT product_id FROM "Conversation" WHERE conversation_id=$1`,
    [conversation_id]
  );
  const product_id = data.rows[0]?.product_id;
  try {
    if(product_id){
      const result = await pool.query(`
        SELECT p.quantity FROM "Conversation" c
        JOIN "Product" p ON c.product_id = p.product_id
        WHERE c.conversation_id = $1
      `, [conversation_id]);
      const productQuantity = result.rows[0]?.quantity || 0;
      if (quantity > productQuantity) {
        return res.status(400).json({ message: 'Quantity exceeds available stock' });
      }
      await pool.query(
        `UPDATE "Conversation" SET sold_button_clicked=true,quantity=$1 WHERE conversation_id=$2`,
        [quantity, conversation_id]
      );
      req.app.get('io').to(`conv_${conversation_id}`).emit('sold');
      res.sendStatus(204);
    }
    else{
      await pool.query(
        `UPDATE "Conversation" SET sold_button_clicked=true,quantity=$1,selling_price=$2 WHERE conversation_id=$3`,
        [quantity, selling_price, conversation_id]
      );
      req.app.get('io').to(`conv_${conversation_id}`).emit('sold');
      res.sendStatus(204);
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// mark received (buyer only)
router.put('/:id/received', authorize, async (req, res) => {
  try{
    const conversation_id = req.params.id;
    // pull request_id, seller_id & quantity from this conversation
    const convRes = await pool.query(
      `SELECT request_id, seller_id, buyer_id, quantity, selling_price
       FROM "Conversation" 
       WHERE conversation_id=$1`,
      [conversation_id]
    );
    const { request_id, seller_id, buyer_id, quantity, selling_price } = convRes.rows[0];

    // if it's request‐based, create a new Product from ProductRequest + convo data
    if (request_id) {
      // load request details
      const reqRes = await pool.query(
        `SELECT title, description, location, category_id, sub_category_id, brand_id
         FROM "ProductRequest"
         WHERE request_id=$1`,
        [request_id]
      );
      const req = reqRes.rows[0];

      // insert new product
      const result = await pool.query(
        `INSERT INTO "Product"
           (seller_id, title, description, location, price,
            category_id, sub_category_id, brand_id,
            posted_at, quantity)
         VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),0) RETURNING product_id`,
        [
          seller_id,
          req.title,
          req.description,
          req.location,
          selling_price,
          req.category_id,
          req.sub_category_id,
          req.brand_id
        ]
      );
      const product_id = result.rows[0].product_id;
      await pool.query(
        `INSERT INTO "SellRecord" (product_id, seller_id, buyer_id, quantity, selling_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [product_id, seller_id, buyer_id, quantity, selling_price]
      );
      await pool.query(
        `UPDATE "Conversation" SET product_id=$1 WHERE conversation_id=$2`,
        [product_id, conversation_id]
      );
      await pool.query(
        `DELETE FROM "ProductRequest" WHERE request_id=$1`,
        [request_id]
      );
    }
    await pool.query(
      `UPDATE "Conversation" SET status='closed' WHERE conversation_id=$1`,
      [conversation_id]
    );
    req.app.get('io').to(`conv_${conversation_id}`).emit('received');
    res.sendStatus(204);
  } catch (error) {
    console.error('Error marking conversation as received:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// delete a message (sender only)
router.delete('/:id/messages/:messageId', authorize, async (req, res) => {
  const conversationId = req.params.id;
  const messageId      = req.params.messageId;
  try {
    // verify the message exists and belongs to this conversation
    const { rows } = await pool.query(
      `SELECT sender_id 
         FROM "Message" 
        WHERE message_id=$1 
          AND conversation_id=$2`,
      [messageId, conversationId]
    );
    if (!rows.length) {
      return res.sendStatus(404);
    }
    // only the original sender may delete
    if (rows[0].sender_id !== req.user.user_id) {
      return res.sendStatus(403);
    }
    // perform deletion
    await pool.query(
      `DELETE FROM "Message" 
         WHERE message_id=$1`,
      [messageId]
    );
    // notify any connected sockets
    req.app.get('io')
       .to(`conv_${conversationId}`)
       .emit('messageDeleted', { message_id: messageId });
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
import { useNavigate } from 'react-router-dom';
import './CoverPage.css';
import bannerImage from '../assets/market-banner.jpg'; // this will be used as background
import mascotImage from '../assets/undraw_domain-names_f0ge.svg'; // this will be used as a mascot image
function CoverPage() {
  const navigate = useNavigate();

  return (
    <div className="cover-full-bg d-flex justify-content-start align-items-center text-white text-center">
      <div className="glass-card p-5 ms-5 me-4">
        <h1 className="display-4 fw-bold mb-3">Marketplace 360</h1>
        <p className="lead mb-4">
          Discover a vibrant online marketplace where buyers meet sellers. Browse a wide range of curated products, enjoy seamless experiences, and connect with a trusted community.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button
            className="btn btn-light btn-lg fw-semibold shadow-sm"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="btn btn-outline-light btn-lg fw-semibold shadow-sm"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </div>
      <div className="mascot-wrapper me-5 ms-4">
        <img src={mascotImage} alt="Mascot" className="mascot-img" />
      </div>
    </div>
  );
}

export default CoverPage;

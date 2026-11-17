import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LogOut, User, ArrowUpRight } from 'react-feather';
import { Reveal, Stagger, StaggerItem } from '../../motion/kit';
import './Dashboard.css';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const userDataSnapshot = await getDoc(userDoc);

          if (userDataSnapshot.exists()) {
            setUserData(userDataSnapshot.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!userData) {
    // Show loading state while fetching data
    return (
      <div className="dash us-page" role="status" aria-live="polite">
        <div className="us-container dash-container">
          <div className="dash-header">
            <span className="us-skeleton dash-skel-avatar" />
            <div className="dash-skel-lines">
              <span className="us-skeleton dash-skel-title" />
              <span className="us-skeleton dash-skel-line" />
            </div>
          </div>
          <div className="us-skeleton dash-skel-panel" />
          <p className="dash-loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard dash us-page">
      <div className="us-container dash-container">
        {/* Header Section */}
        <Reveal className="dash-header" inView={false} duration={0.5}>
          {/* User Icon */}
          <div className="dash-avatar" aria-hidden="true">
            <User size={24} />
          </div>

          {/* Greeting and Welcome Message */}
          <div className="dash-info">
            <h1 className="dash-title">{getGreeting()}, {userData.firstName}</h1>
            <p className="dash-welcome">Welcome to your UrjaShakti dashboard</p>
          </div>

          {/* Logout Button */}
          <button className="us-btn us-btn--secondary dash-logout" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </Reveal>

        {/* Main Section */}
        <div className="dash-main">
          <Reveal className="dash-profile" inView={false} delay={0.1} duration={0.5}>
            <h2 className="dash-heading">User Details</h2>
            <dl className="dash-details">
              <div>
                <dt>Full name</dt>
                <dd>{userData.firstName} {userData.lastName}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{userData.email}</dd>
              </div>
            </dl>
          </Reveal>

          {/* Shortcuts to the existing screens. Links only: no stored progress is shown. */}
          <nav className="dash-shortcuts" aria-label="Your solar plan">
            <h2 className="dash-heading">Your solar plan</h2>
            <Stagger as="ul" className="dash-links" inView={false} delay={0.2} gap={0.06}>
              {[
                { to: '/calculator', label: 'Roof map', note: 'Trace your roof and size the system' },
                { to: '/energy-estimation', label: 'Electricity bill', note: 'Turn your bill into units used' },
                { to: '/report', label: 'Report', note: 'Cost, subsidy, payback and savings' },
                { to: '/vendor', label: 'Partner vendors', note: 'Panels, prices and contacts' },
              ].map((item, i) => (
                <StaggerItem as="li" key={item.to}>
                  <Link to={item.to} className="dash-link">
                    <span className="dash-link-num us-nums">{`0${i + 1}`}</span>
                    <span className="dash-link-body">
                      <b>{item.label}</b>
                      <span>{item.note}</span>
                    </span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

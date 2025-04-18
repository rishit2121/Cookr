import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPopup = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: '#202020',
      minHeight: '100dvh',
      padding: '20px 00px',
      color: 'white',
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: '20px',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '36px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
            height: '50px'
          }}
        >
          ←
        </button>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          color: 'white'
        }}>
          C<span style={{ fontStyle: "italic", }}>oo</span>kr
        </h1>
      </div>
      
      <div style={{
        borderBottom: '1px solid #e1af32',
        marginBottom: '40px',
        width:'100dvw'
      }} />

      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        Privacy Policy
      </h2>

      <div style={{
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#cccccc',
        width:'90dvw',
        margin:'0 auto'
      }}>
            <p style={{ textAlign: 'right', fontStyle: 'italic' }}>Last Updated: Nov. 28, 2024</p>
            <p>Welcome to Cookr, a study app designed for students aged 12 and older. This Privacy Policy outlines how we collect, use, and protect your personal information.</p>

            <h2>1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul>
                <li>Name and email address for account creation</li>
                <li>Usage data to improve our services</li>
                <li>Device information for technical support</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
                <li>Create and manage your account</li>
                <li>Provide personalized learning experiences</li>
                <li>Send important updates and notifications</li>
                <li>Improve our app's functionality</li>
            </ul>

            <h2>3. Data Protection</h2>
            <p>We implement security measures to protect your information, including:</p>
            <ul>
                <li>Encryption of sensitive data</li>
                <li>Regular security audits</li>
                <li>Secure data storage practices</li>
            </ul>

            <h2>4. Third-Party Services</h2>
            <p>We use third-party services that may collect information:</p>
            <ul>
                <li>Google Analytics for usage statistics</li>
                <li>Payment processors for subscription management</li>
                <li>Cloud storage providers for data backup</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
                <li>Access your personal information</li>
                <li>Request corrections to your data</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
            </ul>

            <h2>6. Children's Privacy</h2>
            <p>Our app is designed for users aged 12 and older. We do not knowingly collect information from children under 12. If we discover we have collected information from a child under 12, we will delete it immediately.</p>

            <h2>7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our app and updating the "Last Updated" date.</p>

            <h2>8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:alsonchang.digital@gmail.com">alsonchang.digital@gmail.com</a></p>
          </div>
    </div>
  );
};

export default PrivacyPolicyPopup;
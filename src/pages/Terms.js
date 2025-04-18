import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
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
        Terms and Conditions
      </h2>

      <div style={{
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#cccccc',
        width:'90dvw',
        margin:'0 auto'
      }}>
            <p style={{ textAlign: 'right', fontStyle: 'italic' }}>Last Updated: Nov. 28, 2024</p>
            <p>Welcome to Cookr, a study app designed for students aged 12 and older. By using our app, you agree to the following Terms of Use. Please read them carefully.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using Cookr, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use our app.</p>

            <h2>2. Eligibility</h2>
            <p>Cookr is intended for users aged 12 and older. By using the app, you confirm that you meet this age requirement.</p>

            <h2>3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.</p>

            <h2>4. Use of Google Gemini API</h2>
            <p>Cookr uses the Google Gemini API to provide certain functionalities within the app. By using our app, you acknowledge that:</p>
            <ul>
                <li>Your use of Google's Gemini API is subject to Google's Terms of Service and Privacy Policy.</li>
                <li>We are not responsible for any issues or disruptions related to the API.</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>All content and materials available on Cookr, including but not limited to text, graphics, logos, and software, are the property of Cookr or its licensors and are protected by intellectual property laws. You may not copy, distribute, or create derivative works from any content on Cookr without our express written permission.</p>

            <h2>6. User Content</h2>
            <p>You may be able to submit or upload content to Cookr. By doing so, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, display, reproduce, and distribute such content in connection with the app. You are solely responsible for the content you submit and must ensure it complies with all applicable laws and regulations.</p>

            <h2>7. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul>
                <li>Use Cookr for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Attempt to interfere with the operation of the app or access it through unauthorized means.</li>
                <li>Use the app to transmit any harmful or malicious content.</li>
            </ul>

            <h2>8. Disclaimer of Warranties</h2>
            <p>Cookr is provided on an "as-is" and "as-available" basis. We make no warranties or representations about the app's accuracy, reliability, or availability. Your use of Cookr is at your own risk.</p>

            <h2>9. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Cookr and its affiliates will not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the app.</p>

            <h2>10. Changes to Terms</h2>
            <p>We may update these Terms of Use from time to time. We will notify you of any significant changes by posting the new terms on our app. Your continued use of Cookr after such changes constitutes your acceptance of the new terms.</p>

            <h2>11. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to Cookr at any time, with or without cause, and with or without notice.</p>

            <h2>12. Contact Us</h2>
            <p>If you have any questions or concerns about these Terms of Use, please contact us at <a href="mailto:alsonchang.digital@gmail.com">alsonchang.digital@gmail.com</a></p>
          </div>
    </div>
  );
};

export default Terms; 
import Navbar from "./components/Navbar";
import Scroller from "./components/Scroller";
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Library from "./pages/Library";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AffiliatePage from "./pages/Affiliate";
import SavedQuestions from "./components/Saved";
import Explore from "./pages/Explore";
import Quiz from "./pages/Quiz";
import Results from "./pages/results";
import SubscribeForm from "./components/SubscribeForm"; // New subscription page
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CancelSubscription from "./components/CancelSubscription"; // New subscription page
import Reels from "./pages/VideoScroller";
import Scrolls from "./pages/Scrolls";
import FlashCard from "./pages/Flashcard";
import Featured from "./pages/Featured_Sets";
import Leaderboard from "./pages/LeaderboardPage";
const stripePromise = loadStripe("pk_test_51NDfrSF2kI0aSHJWEUmuSmUqVTFRTKvvDcBKtGVuEC4WdgqXvw1eiE3f0etV8s8fSAdlp774vmPwCvUSORmsVfY300UlG4SuFH");



function App() {
  return (
    <div className="App" style={{overflowY:"hidden"}}>
      {/* Wrap the app or specific routes with Elements to enable Stripe */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/affiliate" element={<AffiliatePage />} />
          <Route path="/saved" element={<SavedQuestions />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="/featured" element={<Featured />} />
          <Route path="/flashcards" element={<FlashCard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
          path="/subscribe"
          element={
            <Elements stripe={stripePromise}>
              <SubscribeForm />
            </Elements>
          }
        />
          {/* <Route path="/cancel" element={<CancelSubscription />} /> Add the new subscription route */}
          <Route path="/reels" element={<Reels />} /> Add the new subscription route
          <Route path="/scrolls" element={<Scrolls />} />



        </Routes>
    </div>
  );
}

export default App;

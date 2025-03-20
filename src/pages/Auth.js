import AuthBox from "../components/AuthBox";
import { useNavigate } from "react-router-dom";
import cookrLogo from "../assets/CookrLogo.webp";


function Auth() {
  const navigate = useNavigate();
  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background:"black"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginBottom:"-50px"
        }}
      >
        <img style={{ height: "140px" }} src={cookrLogo} />

        <br></br>
      </div>
      <AuthBox></AuthBox>
    </div>
  );
}

export default Auth;

import AuthBox from "../components/AuthBox";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();
  return (
    <div
      className="App"
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 onClick={async () => navigate("/")} style={{ margin: "10px 0px", textShadow: "2px 2px 5px orange" }}>
          Scro<span style={{ fontStyle: "italic" }}>ll</span>er
        </h1>
        <br></br>
      </div>
      <AuthBox></AuthBox>
    </div>
  );
}

export default Auth;

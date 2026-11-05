import LoginForm from "../../components/LoginForm/LoginForm";
import "./Login.css";
import loginPageImage from "../../../assets/LoginPage.png";

const Login = () => {
    return (
        <div className="login-page">
            <div className="login-container">

                {/* Left Side Illustration */}
                <div className="login-left">
                    <img
                        src={loginPageImage}
                        alt="Login Illustration"
                        className="login-illustration"
                    />
                </div>

                {/* Right Side */}
                <div className="login-right">
                    <LoginForm />
                </div>

            </div>
        </div>
    );
};

export default Login;
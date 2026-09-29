import { SignIn } from "@clerk/react";

function Login() {
  return (
    <div>
      <h1>ZanCart Admin</h1>

      <SignIn routing="path" path="/login" />
    </div>
  );
}
export default Login;

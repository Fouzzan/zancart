import { useClerk } from "@clerk/react";

function Unauthorized() {
  const { signOut } = useClerk();
  return (
    <div>
      <h1>Access Denied</h1>
      <p>You don't have permission to access the ZanCart Admin Panel.</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}

export default Unauthorized;

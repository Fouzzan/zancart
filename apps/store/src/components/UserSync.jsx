import { useUser } from "@clerk/react";
import { useEffect } from "react";
import { syncUser } from "../services/userServices";

function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    const synchronizeUser = async () => {
      try {
        await syncUser(user);
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    };

    synchronizeUser();
  }, [user, isLoaded]);

  return null;
}

export default UserSync;

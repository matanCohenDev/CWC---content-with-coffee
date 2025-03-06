import { useLocation } from "react-router-dom";

interface User {
  _id: string;
  username: string;
  email: string;
  bio: string;
  favorite_coffee: string;
  location: string;
}


export default function UserProfile() {
  const location = useLocation();
  const { user } = location.state as { user: User };

  return (
    <div>
      <h1>User Profile</h1>
      <p>
        <strong>Name:</strong> {user.username}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Bio:</strong> {user.bio}
      </p>
      <p>
        <strong>Favorite Coffee:</strong> {user.favorite_coffee}
      </p>
      <p>
        <strong>Location:</strong> {user.location}
      </p>
      {/* הוסף כאן פרטים נוספים לפי הצורך */}
    </div>
  );
}

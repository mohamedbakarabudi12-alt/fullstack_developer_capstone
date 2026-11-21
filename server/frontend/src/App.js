import LoginPanel from "./components/Login/Login"
import RegisterPanel from "./components/Register/Register";
import Header from "./components/Header/Header";
import { Routes, Route } from "react-router-dom";
import Dealers from "./components/Dealers/Dealers";
import Dealer from "./components/Dealers/Dealer";
import PostReview from "./components/Dealers/PostReview";

function Home() {
  const username = sessionStorage.getItem("username");
  return (
    <>
      <Header />
      <main className="auth-home">
        <p className="auth-eyebrow">Find your next ride</p>
        <h1>{username ? `Welcome, ${username}` : "Find a dealership you can trust"}</h1>
        <p>Explore dealerships, read customer reviews, and share your experience.</p>
        <a className="auth-button home-button" href="/dealers">Browse dealerships</a>
      </main>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login/" element={<LoginPanel />} />
      <Route path="/register/" element={<RegisterPanel />} />
      <Route path="/dealers" element={<Dealers />} />
      <Route path="/dealer/:id" element={<Dealer />} />
      <Route path="/postreview/:id" element={<PostReview />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
export default App;

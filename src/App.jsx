import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Subscription from "./Subscription";
import Home from "./Home";
import Scorepage from "./Scorepage";
import AdminDashboard from "./AdminDashboard";
import ViewResults from "./ViewResults";
import UserWinnings from "./UserWinnings";
import AdminWinners from "./AdminWinners";
import AdminUsers from "./AdminUsers";
import AdminCharities from "./AdminCharities";
import SelectCharity from "./SelectCharity";
import CreateCharity from "./CreateCharity";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute ><Dashboard /></ProtectedRoute >} />
        <Route path="/subscribe" element={<ProtectedRoute ><Subscription /></ProtectedRoute >} />
        <Route path="/Scorepage" element={<ProtectedRoute ><Scorepage/></ProtectedRoute >} />
        <Route path="/AdminDashboard" element={<ProtectedRoute ><AdminDashboard/></ProtectedRoute >} />
        <Route path="/ViewResults" element={<ProtectedRoute ><ViewResults/></ProtectedRoute >} />
        <Route path="/UserWinnings" element={<ProtectedRoute ><UserWinnings/></ProtectedRoute >} />
        <Route path="/AdminWinners" element={<ProtectedRoute ><AdminWinners /></ProtectedRoute >} />
        <Route path="/AdminUsers" element={<ProtectedRoute ><AdminUsers/></ProtectedRoute >} />
        <Route path="/AdminCharities" element={<ProtectedRoute ><AdminCharities/></ProtectedRoute >} />
        <Route path="/CreateCharity" element={<ProtectedRoute >< CreateCharity/></ProtectedRoute >} />
        <Route path="/SelectCharity" element={<ProtectedRoute >< SelectCharity/></ProtectedRoute >} />
         <Route path="/Profile" element={<ProtectedRoute ><Profile/></ProtectedRoute >} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
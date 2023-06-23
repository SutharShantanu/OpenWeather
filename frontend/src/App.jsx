import "./App.css";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import Wrapper from "./Routes/Wrapper";

function App() {
    return (
        <div className="App">
            <Navbar />
            <Wrapper />
            <Footer />
        </div>
    );
}

export default App;

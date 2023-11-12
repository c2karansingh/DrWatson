import "./App.css";
import AudioRecorder from "../src/AudioRecorder";

const App = () => {
    return (
        <div>
            <h1>Patient Notes Recorder</h1>
            <div>
                {<AudioRecorder />}
            </div>
        </div>
    );
};
export default App;
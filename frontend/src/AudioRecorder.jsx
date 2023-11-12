import { useState, useRef } from "react";
const mimeType = "audio/mp3";

const AudioRecorder = () => {
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState(null);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = async () => {
        setRecordingStatus("recording");
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, { type: mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = async () => {
        setRecordingStatus("inactive");


        //stops the recording instance
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = async () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            //creates a playable URL from the blob file.
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudio(audioUrl);
            setAudioChunks([]);

            const response = await fetch('https://33u3xqbrwj.execute-api.us-east-1.amazonaws.com/patient', {
                method: 'GET',
            });
    
            const data = await response.json(); 
            const pid = data.patient_id;
            try {
                // Fetch the pre-signed URL from your server
                const response = await fetch(`https://33u3xqbrwj.execute-api.us-east-1.amazonaws.com/patient/${pid}/recording`);
                if (!response.ok) {
                    throw new Error('Failed to get pre-signed URL');
                }
    
                const { url } = await response.json();
                console.log(url);
                // Use the pre-signed URL to upload the audio file
                const uploadResponse = await fetch(decodeURI(url), {
                    method: 'PUT', // or 'POST' depending on your server configuration
                    body: audioBlob,
                    headers: {
                        'Content-Type': mimeType,
                    },
                });
    
                if (uploadResponse.ok) {
                    // The audio file has been successfully uploaded
                    console.log('Audio uploaded successfully');
                } else {
                    console.error('Failed to upload audio to S3:', uploadResponse.status, uploadResponse.statusText);
                }
            } catch (error) {
                console.error('Error during S3 upload:', error);
            }
        };

        

    };


    return (
        <div>
            
            <main>
                <h1>Patient Notes Recorder</h1>
                <div className="audio-controls">
                    {!permission ? (
                        <button onClick={getMicrophonePermission} type="button">
                            Get Microphone
                        </button>
                    ) : null}
                    {permission && recordingStatus === "inactive" ? (
                        <button onClick={startRecording} type="button">
                            Start Recording
                        </button>
                    ) : null}
                    {recordingStatus === "recording" ? (
                        <button onClick={stopRecording} type="button">
                            Stop Recording
                        </button>
                    ) : null}
                </div>

                {audio ? (
                    <div className="audio-container">
                        <audio src={audio} controls></audio>
                        <a download href={audio}>
                            Download Recording
                        </a>
                    </div>
                ) : null}

            </main>
            <h6>*Please provide microphone access first*</h6>
        </div>
    );
};
export default AudioRecorder;
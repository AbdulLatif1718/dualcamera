import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers'; // Import directly from ethers
import FailoverCameraSystemABI from './FailoverCameraSystemABI.json'; // Path to your ABI

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Your Hardhat contract address
const abi = FailoverCameraSystemABI.abi;

function CameraControl() {
    // State for camera status and timestamps
    const [camera1Status, setCamera1Status] = useState(1); // Default to Up
    const [camera2Status, setCamera2Status] = useState(0); // Default to Down
    const [camera1Timestamp, setCamera1Timestamp] = useState(new Date());
    const [camera2Timestamp, setCamera2Timestamp] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Refs for the video elements
    const camera1Ref = useRef(null);
    const camera2Ref = useRef(null);

    useEffect(() => {
        // Access the camera streams for both cameras
        const getCameraStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // Assign the stream to the respective video elements
                if (camera1Ref.current && camera1Status === 1) {
                    camera1Ref.current.srcObject = stream;
                }
                if (camera2Ref.current && camera2Status === 1) {
                    camera2Ref.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Failed to access camera. Please make sure you have granted permission.");
            }
        };

        getCameraStream();

        return () => {
            // Cleanup: Stop the camera streams on unmount
            if (camera1Ref.current && camera1Ref.current.srcObject) {
                const tracks = camera1Ref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            if (camera2Ref.current && camera2Ref.current.srcObject) {
                const tracks = camera2Ref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [camera1Status, camera2Status]);

    useEffect(() => {
        const updateTimestamps = () => {
            const now = new Date();
            if (camera1Status === 1) {
                setCamera1Timestamp(now);
            }
            if (camera2Status === 1) {
                setCamera2Timestamp(now);
            }
        };

        // Update timestamps every second
        const intervalId = setInterval(updateTimestamps, 1000);

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [camera1Status, camera2Status]);

    const handleToggleCamera = async (cameraId) => {
        setLoading(true);
        setError(null);

        try {
            // Simulate toggling camera status
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

            if (cameraId === 1) {
                const newStatus = camera1Status === 0 ? 1 : 0; // Toggle between Up (1) and Down (0)
                setCamera1Status(newStatus);
            } else {
                const newStatus = camera2Status === 0 ? 1 : 0; // Toggle between Up (1) and Down (0)
                setCamera2Status(newStatus);
            }

            alert(`Camera ${cameraId} status updated to ${cameraId === 1 ? (camera1Status === 0 ? 'Up' : 'Down') : (camera2Status === 0 ? 'Up' : 'Down')}!`);
        } catch (err) {
            console.error("Error updating camera status:", err);
            setError("Failed to update camera status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        return timestamp ? `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}` : 'Loading...';
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    };

    const headerStyle = {
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px',
    };

    const errorMessageStyle = {
        color: 'red',
        textAlign: 'center',
        marginBottom: '20px',
    };

    const cameraSectionStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };

    const cameraStatusStyle = {
        fontWeight: 'bold',
    };

    const cameraStatusUpStyle = {
        color: '#28a745',
    };

    const cameraStatusDownStyle = {
        color: '#dc3545',
    };

    const cameraViewStyle = {
        width: '100%',
        height: '200px',
        backgroundColor: '#e0e0e0',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '18px',
    };

    const timestampStyle = {
        color: '#555',
        fontSize: '14px',
        marginTop: '10px',
    };

    const buttonStyle = {
        display: 'block',
        width: '100%',
        padding: '10px',
        marginTop: '10px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    };

    const buttonDisabledStyle = {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    };

    const buttonEnabledStyle = {
        backgroundColor: '#007bff',
        color: 'white',
    };

    const buttonEnabledHoverStyle = {
        backgroundColor: '#0056b3',
    };

    return (
        <div style={containerStyle}>
            <h2 style={headerStyle}>Camera Control Interface</h2>
            {error && <p style={errorMessageStyle}>{error}</p>}
            <div style={cameraSectionStyle}>
                <video ref={camera1Ref} autoPlay style={cameraViewStyle}></video>
                <h3>
                    Primary Camera (1):{' '}
                    <span
                        style={{
                            ...cameraStatusStyle,
                            ...(camera1Status === 1 ? cameraStatusUpStyle : cameraStatusDownStyle),
                        }}
                    >
                        {camera1Status === 0 ? 'Down' : 'Up'}
                    </span>
                </h3>
                <p style={timestampStyle}>Timestamp: {formatTimestamp(camera1Timestamp)}</p>
                <button
                    onClick={() => handleToggleCamera(1)}
                    disabled={loading}
                    style={{
                        ...buttonStyle,
                        ...(loading ? buttonDisabledStyle : buttonEnabledStyle),
                        ...(loading ? {} : buttonEnabledHoverStyle),
                    }}
                >
                    {loading ? 'Processing...' : 'Toggle Camera 1'}
                </button>
            </div>
            <div style={cameraSectionStyle}>
                <video ref={camera2Ref} autoPlay style={cameraViewStyle}></video>
                <h3>
                    Secondary Camera (2):{' '}
                    <span
                        style={{
                            ...cameraStatusStyle,
                            ...(camera2Status === 1 ? cameraStatusUpStyle : cameraStatusDownStyle),
                        }}
                    >
                        {camera2Status === 0 ? 'Down' : 'Up'}
                    </span>
                </h3>
                <p style={timestampStyle}>Timestamp: {formatTimestamp(camera2Timestamp)}</p>
                <button
                    onClick={() => handleToggleCamera(2)}
                    disabled={loading}
                    style={{
                        ...buttonStyle,
                        ...(loading ? buttonDisabledStyle : buttonEnabledStyle),
                        ...(loading ? {} : buttonEnabledHoverStyle),
                    }}
                >
                    {loading ? 'Processing...' : 'Toggle Camera 2'}
                </button>
            </div>
        </div>
    );
}

export default CameraControl;

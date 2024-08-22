import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import FailoverCameraSystemABI from './FailoverCameraSystemABI.json'; // Path to your ABI

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function CameraControl() {
    const [camera1Status, setCamera1Status] = useState(null);
    const [camera2Status, setCamera2Status] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCameraStatus = async () => {
            try {
                if (!window.ethereum) throw new Error("No Ethereum provider found!");

                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = new Contract(CONTRACT_ADDRESS, FailoverCameraSystemABI, signer);

                const [status1] = await contract.getCameraStatus(1);
                const [status2] = await contract.getCameraStatus(2);

                setCamera1Status(status1);
                setCamera2Status(status2);
            } catch (err) {
                console.error("Error fetching camera status:", err);
                setError("Failed to fetch camera status. Ensure you're connected to the right network.");
            }
        };

        fetchCameraStatus();
    }, []);

    const handleToggleCamera = async (cameraId) => {
        try {
            setLoading(true);
            setError(null);

            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, FailoverCameraSystemABI, signer);

            const currentStatus = cameraId === 1 ? camera1Status : camera2Status;
            const newStatus = currentStatus === 0 ? 1 : 0; // Toggle between Up (1) and Down (0)

            await contract.updateCameraStatus(cameraId, newStatus);

            // Update UI after status change
            if (cameraId === 1) {
                setCamera1Status(newStatus);
            } else {
                setCamera2Status(newStatus);
            }

            alert(`Camera ${cameraId} status updated to ${newStatus === 0 ? 'Down' : 'Up'}!`);
        } catch (err) {
            console.error("Error updating camera status:", err);
            setError("Failed to update camera status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Camera Control Interface</h2>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.cameraControl}>
                <h3 style={styles.cameraStatus}>Primary Camera (1): <span style={camera1Status === 0 ? styles.statusDown : styles.statusUp}> {camera1Status === 0 ? 'Down' : 'Up'}</span></h3>
                <button
                    onClick={() => handleToggleCamera(1)}
                    disabled={loading}
                    style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                >
                    {loading ? 'Processing...' : 'Toggle Camera 1'}
                </button>
            </div>
            <div style={styles.cameraControl}>
                <h3 style={styles.cameraStatus}>Secondary Camera (2): <span style={camera2Status === 0 ? styles.statusDown : styles.statusUp}> {camera2Status === 0 ? 'Down' : 'Up'}</span></h3>
                <button
                    onClick={() => handleToggleCamera(2)}
                    disabled={loading}
                    style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                >
                    {loading ? 'Processing...' : 'Toggle Camera 2'}
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '30px',
        maxWidth: '700px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        backgroundColor: '#e8f0fe',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    },
    header: {
        color: '#1a73e8',
        marginBottom: '30px',
        fontSize: '24px',
        fontWeight: '600',
    },
    error: {
        color: '#d32f2f',
        marginBottom: '20px',
        fontSize: '16px',
    },
    cameraControl: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    cameraStatus: {
        fontSize: '20px',
        marginBottom: '15px',
    },
    statusUp: {
        color: '#4caf50',
        fontWeight: 'bold',
    },
    statusDown: {
        color: '#f44336',
        fontWeight: 'bold',
    },
    button: {
        padding: '12px 24px',
        fontSize: '18px',
        color: '#fff',
        backgroundColor: '#1a73e8',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, transform 0.2s',
        outline: 'none',
    },
    buttonDisabled: {
        backgroundColor: '#b0bec5',
        cursor: 'not-allowed',
    },
};

export default CameraControl;

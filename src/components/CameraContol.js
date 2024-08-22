import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
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
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, FailoverCameraSystemABI, signer);

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

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, FailoverCameraSystemABI, signer);

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
        <div>
            <h2>Camera Control Interface</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <h3>Primary Camera (1): {camera1Status === 0 ? 'Down' : 'Up'}</h3>
                <button onClick={() => handleToggleCamera(1)} disabled={loading}>
                    {loading ? 'Processing...' : 'Toggle Camera 1'}
                </button>
            </div>
            <div>
                <h3>Secondary Camera (2): {camera2Status === 0 ? 'Down' : 'Up'}</h3>
                <button onClick={() => handleToggleCamera(2)} disabled={loading}>
                    {loading ? 'Processing...' : 'Toggle Camera 2'}
                </button>
            </div>
        </div>
    );
}

export default CameraControl;

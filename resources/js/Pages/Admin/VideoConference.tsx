import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect, useRef } from 'react';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function VideoConference() {
    const [meetingStarted, setMeetingStarted] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);

    useEffect(() => {
        // Check URL for room parameter
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        if (roomParam) {
            setRoomName(decodeURIComponent(roomParam));
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
        
        if (existingScript) {
            setScriptLoaded(true);
            return;
        }

        // Load Jitsi Meet API script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => {
            setScriptLoaded(true);
        };
        document.body.appendChild(script);

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, []);

    const startMeeting = () => {
        if (!roomName || !displayName) {
            alert('Please enter both room name and your name');
            return;
        }

        if (!scriptLoaded || !window.JitsiMeetExternalAPI) {
            alert('Video conference is loading, please wait a moment and try again');
            return;
        }

        // Set meeting started first to render the container
        setMeetingStarted(true);

        // Wait for container to render, then initialize Jitsi
        setTimeout(() => {
            if (!jitsiContainerRef.current) {
                alert('Video container not ready, please try again');
                setMeetingStarted(false);
                return;
            }

            const domain = 'meet.jit.si';
            const options = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: displayName,
                },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                },
            };

            try {
                apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
                
                apiRef.current.addEventListener('videoConferenceLeft', () => {
                    endMeeting();
                });
            } catch (error) {
                console.error('Error starting meeting:', error);
                alert('Failed to start meeting. Please try again.');
                setMeetingStarted(false);
            }
        }, 200);
    };

    const endMeeting = () => {
        if (apiRef.current) {
            apiRef.current.dispose();
            apiRef.current = null;
        }
        setMeetingStarted(false);
    };

    const generateRandomRoom = () => {
        const randomRoom = 'primevolt-' + Math.random().toString(36).substring(2, 10);
        setRoomName(randomRoom);
    };

    return (
        <AdminLayout>
            <Head title="Video Conference" />

            <div className="p-6 h-[calc(100vh-80px)]">
                {!meetingStarted ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-video text-4xl text-primary"></i>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Video Conference</h1>
                                <p className="text-gray-600">Start or join a secure video meeting</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Name
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={roomName}
                                            onChange={(e) => setRoomName(e.target.value)}
                                            placeholder="Enter room name or generate one"
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <button
                                            onClick={generateRandomRoom}
                                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            title="Generate random room name"
                                        >
                                            <i className="fas fa-random"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Share this room name with others to join the same meeting
                                    </p>
                                </div>

                                <button
                                    onClick={startMeeting}
                                    disabled={!scriptLoaded}
                                    className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        scriptLoaded 
                                            ? 'bg-primary text-white hover:bg-primary-dark' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {scriptLoaded ? (
                                        <>
                                            <i className="fas fa-video"></i>
                                            Start Meeting
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Loading...
                                        </>
                                    )}
                                </button>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">Features:</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                            HD Video & Audio
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                            Screen Sharing
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                            Chat Messages
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                            Recording
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                            Secure & Encrypted
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <i className="fas fa-check-circle text-green-500"></i>
                                            No Time Limits
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-primary text-white px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <i className="fas fa-video"></i>
                                <span className="font-semibold">Meeting: {roomName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const meetingLink = `${window.location.origin}/admin/video-conference?room=${encodeURIComponent(roomName)}`;
                                        navigator.clipboard.writeText(meetingLink);
                                        alert('Meeting link copied to clipboard!');
                                    }}
                                    className="px-4 py-2 bg-accent-yellow text-primary-dark hover:bg-yellow-400 rounded-lg transition-colors flex items-center gap-2"
                                    title="Copy meeting link"
                                >
                                    <i className="fas fa-link"></i>
                                    Share Link
                                </button>
                                <button
                                    onClick={endMeeting}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <i className="fas fa-phone-slash"></i>
                                    Leave Meeting
                                </button>
                            </div>
                        </div>
                        <div ref={jitsiContainerRef} className="flex-1" />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

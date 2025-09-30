import { useParams, useNavigate } from 'react-router-dom';
import VideoCall from '@/components/ui/VideoCall';

export default function VideoCallPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    if (!roomId) {
        navigate('/');
        return null;
    }

    const handleLeave = () => {
        navigate(-1); 
    };

    return <VideoCall roomId={roomId} onLeave={handleLeave} />;
}
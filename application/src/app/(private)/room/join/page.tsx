import JoinRoomForm from "@/components/room/JoinRoomForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JoinRoomPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Join a Room</CardTitle>
        </CardHeader>
        <CardContent>
          <JoinRoomForm />
        </CardContent>
      </Card>
    </div>
  );
}

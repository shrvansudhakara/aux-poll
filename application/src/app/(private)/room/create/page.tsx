import CreateRoomForm from "@/components/room/CreateRoomForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateRoomPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Create a Room</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateRoomForm />
        </CardContent>
      </Card>
    </div>
  );
}

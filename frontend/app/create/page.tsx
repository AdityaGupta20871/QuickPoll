import { CreatePollForm } from "@/components/polls/CreatePollForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreatePollPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Button>
        </Link>
      </div>
      
      <CreatePollForm />
    </div>
  );
}

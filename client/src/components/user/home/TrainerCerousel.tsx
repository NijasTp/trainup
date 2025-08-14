import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTrainers } from "@/services/userService";
import { Badge } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";


interface ITrainer {
  _id: number;
  name: string;
  profileImage: string;
  specialty: string;
}

export function TrainerCarousel() {
  const [trainers, setTrainers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrainers() {
      try {
        const response = await getTrainers(1,5,'');
        setTrainers(response.trainers.trainers);
      } catch (err: any) {
        setError(err.response.data.error || 'failed to fetch trainers. Please try again.');
        toast.error(err.response.data.error || 'failed to fetch trainers. Please try again.');
      } finally {
       
      }
    }
    fetchTrainers();
  }, []);


  if (error) {
    return (
      <section aria-labelledby="trainers">
        <h2 id="trainers" className="text-xl font-semibold mb-3">Featured Trainers</h2>
        <p className="text-destructive">Error: {error}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="trainers">
      <div className="flex items-center justify-between mb-3">
        <h2 id="trainers" className="text-xl font-semibold">Featured Trainers</h2>

      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {trainers.map((t: ITrainer) => (
          <Link to={`/trainers/${t._id}`}>
            <div key={t._id} className="min-w-[260px] snap-start">
              <Card className="h-full hover-scale">
                <CardContent className="p-0">
                  <img src={t.profileImage} alt={`${t.name} - ${t.specialty||''}`} className="h-50 w-50 ml-6 rounded-sm object-cover" loading="lazy" />
                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{t.name}</p>
                      <Badge className="bg-accent text-accent-foreground">Hire</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.specialty||''}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Link to="/trainers">
          <Button variant="secondary">See More</Button>
        </Link>
      </div>
    </section>
  );
}
import { Link } from "react-router-dom";
import { Trophy, ExternalLink, MapPin, Calendar, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Seo } from "@/seo/Seo";
import { seoCfl } from "@/seo/seo.config";

export default function CFL() {
  return (
    <div className="min-h-screen">
      <Seo {...seoCfl()} />

      {/* Hero */}
      <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-magenta/15 via-transparent to-transparent" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />

        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="flex items-center justify-center gap-4 mb-6 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <Trophy className="h-8 w-8 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>

          <h1 className="font-display font-bold text-white leading-tight mb-4 animate-rise-up" style={{ animationDelay: "100ms" }}>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg">Compétition</span>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg text-gradient-magenta">CFL Paris</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 font-sport max-w-3xl mx-auto animate-rise-up" style={{ animationDelay: "200ms" }}>
            Le FC Ardentis participe à la <span className="text-white font-semibold">Commission de Football Loisir</span> (CFL).
            Football amateur adulte en Île-de-France.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-section">
        <div className="container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main content */}
            <Card className="premium-card lg:col-span-2">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                  FC Ardentis & la CFL : football amateur loisir à Paris
                </h2>

                <p className="text-muted-foreground font-sport leading-relaxed">
                  Vous cherchez un <span className="font-semibold text-foreground">club de football amateur</span> en région parisienne ?
                  La CFL (Commission de Football Loisir) est une compétition structurée pour les adultes qui veulent jouer régulièrement
                  dans un cadre sérieux mais convivial. Le <span className="font-semibold text-foreground">FC Ardentis</span>, basé à 
                  <span className="font-semibold text-foreground"> Colombes (92)</span> dans les Hauts-de-Seine, y participe avec 
                  une philosophie claire : <span className="font-semibold text-foreground">cohésion, respect et performance</span>.
                </p>

                {/* Key info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground">Localisation</p>
                      <p className="text-muted-foreground font-sport text-sm">Colombes (92), Hauts-de-Seine</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-accent/10">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground">Matchs CFL</p>
                      <p className="text-muted-foreground font-sport text-sm">Lundi ou mercredi soir (Paris & IDF)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-magenta/10">
                      <Users className="h-5 w-5 text-magenta" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground">Public</p>
                      <p className="text-muted-foreground font-sport text-sm">Adultes (18 ans et plus)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground">Niveau</p>
                      <p className="text-muted-foreground font-sport text-sm">Tous niveaux (débutant à confirmé)</p>
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="magenta" className="rounded-xl">
                    <Link to="/calendrier">Voir notre calendrier</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <a href="https://www.cflparis.fr/" target="_blank" rel="noopener noreferrer">
                      Site officiel CFL <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card className="premium-card">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <h3 className="font-display font-bold text-xl text-foreground">Rejoindre un club foot amateur à Paris ?</h3>
                <p className="text-muted-foreground font-sport text-sm">
                  Le FC Ardentis recrute ! Club de foot amateur loisir pour adultes (+18 ans) à Colombes (92).
                  Tous niveaux bienvenus.
                </p>
                <ul className="text-muted-foreground font-sport text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Entraînements le dimanche
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Matchs officiels CFL en semaine
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    Ambiance conviviale & compétitive
                  </li>
                </ul>
                <Button asChild variant="magenta" className="w-full rounded-xl">
                  <Link to="/rejoindre">Nous rejoindre</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link to="/contacts">Nous contacter</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SEO-rich FAQ section */}
          <div className="mt-12 sm:mt-16">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-6 text-center">
              Questions fréquentes sur la CFL et le FC Ardentis
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="premium-card">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    Qu'est-ce que la CFL Paris ?
                  </h3>
                  <p className="text-muted-foreground font-sport text-sm">
                    La CFL (Commission de Football Loisir) est une compétition de football amateur pour adultes
                    en région parisienne. Elle regroupe des clubs loisir qui jouent des matchs officiels en semaine,
                    offrant une alternative aux championnats du week-end.
                  </p>
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    Comment rejoindre un club CFL comme le FC Ardentis ?
                  </h3>
                  <p className="text-muted-foreground font-sport text-sm">
                    C'est simple : rendez-vous sur notre page{" "}
                    <Link to="/rejoindre" className="text-primary hover:underline">"Nous rejoindre"</Link>{" "}
                    et remplissez le formulaire joueur. Nous vous recontacterons pour organiser un essai.
                    Le club est ouvert aux adultes (18+) de tous niveaux.
                  </p>
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    Où joue le FC Ardentis ?
                  </h3>
                  <p className="text-muted-foreground font-sport text-sm">
                    Le FC Ardentis est basé à <strong>Colombes (92)</strong>, dans les Hauts-de-Seine.
                    Les entraînements ont lieu au Stade Yves-du-Manoir le dimanche. Les matchs CFL se déroulent
                    en semaine dans différents stades de Paris et d'Île-de-France.
                  </p>
                </CardContent>
              </Card>
              <Card className="premium-card">
                <CardContent className="p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    Le FC Ardentis accepte-t-il les débutants ?
                  </h3>
                  <p className="text-muted-foreground font-sport text-sm">
                    Oui ! Que vous soyez débutant ou joueur expérimenté, le FC Ardentis vous accueille.
                    L'important pour nous : l'état d'esprit, la motivation et le respect des valeurs du club
                    (cohésion, respect, performance).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

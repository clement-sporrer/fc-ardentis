import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Heart, Send, AlertCircle } from "lucide-react";
import { PhoneField, isValidIntlPhone } from "@/components/PhoneField";

// Config env
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || "";
const GAS_WEBAPP_URL = import.meta.env.VITE_GAS_WEBAPP_URL || "";

interface FormData {
  profile: 'Joueur' | 'Partenaire' | '' ;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // format E.164 (+33612345678)
  birthDate: string;
  role: string;
  company: string;
  message: string;
  consent: boolean;
  referral: '' | 'reseaux' | 'site' | 'joueurActuel' | 'ancienJoueur' | 'connaissance' | 'autre';
  referralDetail: string;
}

const Rejoindre = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    profile: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    role: '',
    company: '',
    message: '',
    consent: false,
    referral: '',
    referralDetail: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    const emailRegex = /\S+@\S+\.\S+/;

    if (!formData.profile) errors.push("Veuillez sélectionner un profil");
    if (!formData.firstName.trim()) errors.push("Le prénom est obligatoire");
    if (!formData.lastName.trim()) errors.push("Le nom est obligatoire");
    if (!formData.email.trim()) errors.push("L'email est obligatoire");
    if (formData.email && !emailRegex.test(formData.email)) errors.push("Email invalide");
    if (!formData.consent) errors.push("Vous devez accepter les conditions");

    // Téléphone optionnel, mais valide s'il est saisi
    if (formData.phone && !isValidIntlPhone(formData.phone)) {
      errors.push("Téléphone invalide pour le pays sélectionné");
    }

    if (formData.profile === 'Joueur') {
      if (!formData.birthDate) errors.push("La date de naissance est obligatoire");
      if (!formData.role) errors.push("Veuillez sélectionner un poste préféré");
    }

    if (formData.profile === 'Partenaire' && !formData.company.trim()) {
      errors.push("Le nom d'entreprise est obligatoire");
    }

    // Détail requis selon l’option
    if (['reseaux', 'joueurActuel', 'ancienJoueur', 'autre'].includes(formData.referral) && !formData.referralDetail.trim()) {
      errors.push("Merci de préciser le détail de votre provenance");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast({ title: "Erreur de validation", description: errors.join(", "), variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        profile: formData.profile,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone, // E.164
        ...(formData.profile === 'Joueur' && {
          birthDate: formData.birthDate,
          role: formData.role,
        }),
        ...(formData.profile === 'Partenaire' && { company: formData.company }),
        referral: formData.referral,
        referralDetail: formData.referralDetail,
        message: formData.message,
        subject: "Nouvelle demande d'adhésion FC Ardentis",
        timestamp: new Date().toISOString()
      };

      let success = false;

      if (FORMSPREE_ENDPOINT) {
        try {
          const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData)
          });
          success = response.ok;
        } catch (error) {
          console.error('Formspree error:', error);
        }
      }

      if (!success && GAS_WEBAPP_URL) {
        try {
          const response = await fetch(GAS_WEBAPP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData)
          });
          success = response.ok;
        } catch (error) {
          console.error('Google Apps Script error:', error);
        }
      }

      if (success) {
        toast({ title: "Demande envoyée !", description: "Nous vous répondrons sous 48h. Merci !" });
        setFormData({
          profile: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          birthDate: '',
          role: '',
          company: '',
          message: '',
          consent: false,
          referral: '',
          referralDetail: ''
        });
      } else {
        throw new Error('Tous les services sont indisponibles');
      }
    } catch {
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue. Essayez plutôt d'envoyer un email à fcardentis@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Modern Hero Section */}
      <section className="bg-gradient-hero py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div className="container max-w-5xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6 text-center">
          Nous <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">rejoindre</span>
        </h1>
        <p className="text-lg text-white/90 font-sport max-w-3xl mx-auto text-center">
          Choisissez votre profil et remplissez le formulaire.<br />
          <span className="text-accent">Nous répondons sous 48h !</span>
        </p>
        </div>
      </section>

      {/* Modern Form */}
      <section className="py-20 px-4 overflow-visible bg-gradient-section">
        <div className="container max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Modern Profile Selection */}
            <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border/10">
              <Label className="text-2xl font-sport-condensed font-bold text-foreground mb-6 block">
                Choisissez votre profil
              </Label>
              <RadioGroup 
                value={formData.profile} 
                onValueChange={(value) => handleInputChange('profile', value as FormData['profile'])}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-3 bg-primary/10 p-6 rounded-xl border border-primary/20 hover-lift">
                  <RadioGroupItem value="Joueur" id="joueur" />
                  <Label htmlFor="joueur" className="font-sport text-lg font-medium">Joueur</Label>
                </div>
                <div className="flex items-center space-x-3 bg-accent/10 p-6 rounded-xl border border-accent/20 hover-lift">
                  <RadioGroupItem value="Partenaire" id="partenaire" />
                  <Label htmlFor="partenaire" className="font-sport text-lg font-medium">Partenaire</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Infos personnelles */}
            {formData.profile && (
              <div className="bg-card p-6 rounded-lg shadow-card border border-border/20 space-y-6 overflow-visible">
                <h3 className="text-lg font-sport-condensed font-bold text-foreground">
                  Informations personnelles
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="font-sport">Prénom *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="font-sport"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="font-sport">Nom *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="font-sport"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="font-sport">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="font-sport"
                    required
                  />
                </div>

                {/* Téléphone international */}
                <div>
                  <Label className="font-sport">Téléphone (optionnel)</Label>
                  <PhoneField
                    value={formData.phone || undefined}
                    onChange={(v) => handleInputChange("phone", v || "")}
                    defaultCountry="FR"
                  />
                  <p className="text-xs text-muted-foreground mt-1 font-sport">
                    Choisissez le pays puis tapez le numéro. Le format et l’indicatif s’adaptent automatiquement.
                  </p>
                </div>
              </div>
            )}

            {/* Infos sportives (Joueur) */}
            {formData.profile === 'Joueur' && (
              <div className="bg-card p-6 rounded-lg shadow-card border border-border/20 space-y-6 overflow-visible">
                <h3 className="text-lg font-sport-condensed font-bold text-foreground">
                  Informations sportives
                </h3>
                
                <div>
                  <Label htmlFor="birthDate" className="font-sport">Date de naissance *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="font-sport"
                    required
                  />
                </div>

                <div>
                  <Label className="font-sport">Poste préféré *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="font-sport">
                      <SelectValue placeholder="Sélectionnez un poste" />
                    </SelectTrigger>
                    {/* Menu flottant + très au-dessus */}
                    <SelectContent position="popper" sideOffset={6} className="z-[9999] bg-card text-card-foreground border border-border shadow-lg">
                      <SelectGroup>
                        <SelectLabel>Gardien</SelectLabel>
                        <SelectItem value="Gardien de but">Gardien de but</SelectItem>
                      </SelectGroup>

                      <SelectGroup>
                        <SelectLabel>Défense</SelectLabel>
                        <SelectItem value="Latéral droit">Latéral droit</SelectItem>
                        <SelectItem value="Défenseur central">Défenseur central</SelectItem>
                        <SelectItem value="Latéral gauche">Latéral gauche</SelectItem>
                      </SelectGroup>

                      <SelectGroup>
                        <SelectLabel>Milieu</SelectLabel>
                        <SelectItem value="Milieu défensif">Milieu défensif</SelectItem>
                        <SelectItem value="Milieu relayeur">Milieu relayeur</SelectItem>
                        <SelectItem value="Milieu offensif">Milieu offensif</SelectItem>
                      </SelectGroup>

                      <SelectGroup>
                        <SelectLabel>Attaque</SelectLabel>
                        <SelectItem value="Ailier droit">Ailier droit</SelectItem>
                        <SelectItem value="Ailier gauche">Ailier gauche</SelectItem>
                        <SelectItem value="Attaquant axial">Attaquant axial</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Référencement / provenance */}
                <div className="space-y-2">
                  <Label className="font-sport">Comment nous avez-vous connu ?</Label>
                  <Select
                    value={formData.referral}
                    onValueChange={(v) => handleInputChange('referral', v)}
                  >
                    <SelectTrigger className="font-sport">
                      <SelectValue placeholder="Sélectionnez une option" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={6} className="z-[9999] bg-card text-card-foreground border border-border shadow-lg">
                      <SelectItem value="reseaux">Réseaux sociaux</SelectItem>
                      <SelectItem value="site">Site web</SelectItem>
                      <SelectItem value="joueurActuel">Joueur actuel</SelectItem>
                      <SelectItem value="ancienJoueur">Ancien joueur</SelectItem>
                      <SelectItem value="connaissance">Connaissance personnelle</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>

                  {(formData.referral === 'reseaux' ||
                    formData.referral === 'joueurActuel' ||
                    formData.referral === 'ancienJoueur' ||
                    formData.referral === 'autre') && (
                    <div>
                      <Label htmlFor="refDetail" className="font-sport">
                        {formData.referral === 'reseaux'
                          ? 'Précisez le réseau'
                          : formData.referral === 'autre'
                          ? 'Précisez'
                          : 'Nom du joueur'}
                      </Label>
                      <Input
                        id="refDetail"
                        type="text"
                        value={formData.referralDetail}
                        onChange={(e) => handleInputChange('referralDetail', e.target.value)}
                        className="font-sport"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Infos Partenaire */}
            {formData.profile === 'Partenaire' && (
              <div className="bg-card p-6 rounded-lg shadow-card border border-border/20 space-y-6 overflow-visible">
                <h3 className="text-lg font-sport-condensed font-bold text-foreground">
                  Informations partenaire
                </h3>
                
                <div>
                  <Label htmlFor="company" className="font-sport">Entreprise *</Label>
                  <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="font-sport"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="supportReason" className="font-sport">Pourquoi voulez-vous nous soutenir ?</Label>
                  <Textarea
                    id="supportReason"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="font-sport"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Message libre (joueur) */}
            {formData.profile === 'Joueur' && (
              <div className="bg-card p-6 rounded-lg shadow-card border border-border/20">
                <Label htmlFor="message" className="font-sport block mb-2">
                  Message libre (optionnel)
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="font-sport"
                  rows={4}
                />
              </div>
            )}

            {/* RGPD */}
            {formData.profile && (
              <div className="bg-card p-6 rounded-lg shadow-card border border-border/20">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => handleInputChange('consent', !!checked)}
                  />
                  <Label htmlFor="consent" className="text-sm font-sport leading-relaxed">
                    J'accepte que mes données personnelles soient utilisées pour traiter ma demande 
                    et me recontacter dans le cadre des activités du FC Ardentis. 
                    Ces données ne seront pas transmises à des tiers. *
                  </Label>
                </div>
              </div>
            )}

            {/* Submit */}
            {formData.profile && (
              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  variant="cta"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer ma demande
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>

          {/* Rappels */}
          <div className="mt-12 bg-secondary p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-sport-condensed font-bold text-secondary-foreground">
                Rappels importants
              </h3>
            </div>
            <div className="text-secondary-foreground/90 font-sport space-y-2">
              <p>• Essais possibles le mercredi ou le dimanche</p>
              <p>• Les horaires seront confirmés par email</p>
              <p>• Réponse garantie sous 48h</p>
            </div>
          </div>

          {/* Info config */}
          {!FORMSPREE_ENDPOINT && !GAS_WEBAPP_URL && (
            <div className="mt-8 bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-sport">
                  Configuration requise : VITE_FORMSPREE_ENDPOINT ou VITE_GAS_WEBAPP_URL
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Rejoindre;

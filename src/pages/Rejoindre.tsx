import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Heart, Send, AlertCircle } from "lucide-react";

// Configuration parameters
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || "";
const GAS_WEBAPP_URL = import.meta.env.VITE_GAS_WEBAPP_URL || "";

// --- Helpers téléphone ---
type Country = 'FR' | 'CH';
const COUNTRY_META: Record<Country, { dial: string; name: string; digitsAfterDial: number }> = {
  FR: { dial: '+33', name: 'France', digitsAfterDial: 9 },
  CH: { dial: '+41', name: 'Suisse', digitsAfterDial: 9 },
};

const onlyDigits = (s: string) => s.replace(/\D/g, '');
const groupBy2 = (s: string) => s.replace(/(\d{2})(?=\d)/g, '$1 ').trim();

interface FormData {
  profile: 'Joueur' | 'Partenaire' | '' ;
  firstName: string;
  lastName: string;
  email: string;
  // téléphone stocké tel qu’affiché : "+33 6 12 34 56 78"
  phone: string;
  phoneCountry: Country;
  birthDate: string;
  role: string;
  company: string;
  message: string;
  consent: boolean;
  // provenance
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
    phoneCountry: 'FR',
    birthDate: '',
    role: '',
    company: '',
    message: '',
    consent: false,
    referral: '',
    referralDetail: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----- PHONE LOGIC -----
  const formatPhone = (country: Country, rawDigits: string) => {
    // FR/CH: si l’utilisateur tape un 0 en premier, on l’enlève après indicatif
    if (rawDigits.startsWith('0')) rawDigits = rawDigits.slice(1);
    rawDigits = rawDigits.slice(0, COUNTRY_META[country].digitsAfterDial); // limite
    const dial = COUNTRY_META[country].dial;
    const grouped = groupBy2(rawDigits);
    return grouped ? `${dial} ${grouped}` : dial;
  };

  const setPhoneCountry = (country: Country) =>
    setFormData(prev => {
      const currentDigits = onlyDigits(prev.phone.replace(COUNTRY_META[prev.phoneCountry].dial, ''));
      return { ...prev, phoneCountry: country, phone: formatPhone(country, currentDigits) };
    });

  const onPhoneChange = (value: string) => {
    // On ne garde que + au début et les chiffres; pas d’espaces saisis par l’utilisateur
    const digits = onlyDigits(value);
    setFormData(prev => ({ ...prev, phone: formatPhone(prev.phoneCountry, digits) }));
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value as any
    }));
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

    // Téléphone: optionnel, mais s'il est renseigné on vérifie le format
    if (formData.phone && formData.phone !== COUNTRY_META[formData.phoneCountry].dial) {
      const afterDial = formData.phone.replace(COUNTRY_META[formData.phoneCountry].dial, '').trim();
      const digits = onlyDigits(afterDial);
      if (digits.length !== COUNTRY_META[formData.phoneCountry].digitsAfterDial) {
        errors.push(`Téléphone: ${COUNTRY_META[formData.phoneCountry].digitsAfterDial} chiffres après l’indicatif`);
      }
    }

    if (formData.profile === 'Joueur') {
      if (!formData.birthDate) errors.push("La date de naissance est obligatoire");
      if (!formData.role) errors.push("Veuillez sélectionner un poste préféré");
    }

    if (formData.profile === 'Partenaire') {
      if (!formData.company.trim()) errors.push("Le nom d'entreprise est obligatoire");
    }

    // Si provenance nécessite un détail
    if (['reseaux', 'joueurActuel', 'ancienJoueur'].includes(formData.referral) && !formData.referralDetail.trim()) {
      errors.push("Merci de préciser le détail de votre provenance");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Erreur de validation",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        profile: formData.profile,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        ...(formData.profile === 'Joueur' && {
          birthDate: formData.birthDate,
          role: formData.role,
        }),
        ...(formData.profile === 'Partenaire' && {
          company: formData.company,
        }),
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
        toast({
          title: "Demande envoyée !",
          description: "Nous vous répondrons sous 48h. Merci pour votre intérêt !",
        });

        // Reset form
        setFormData({
          profile: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          phoneCountry: 'FR',
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
        description: "Une erreur est survenue. Essayez d'envoyer un email directement à fcardentis@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 px-4 text-center">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6">
            Nous rejoindre
          </h1>
          <p className="text-xl text-white/90 font-sport">
            Choisissez votre profil et remplissez le formulaire. Nous répondons sous 48h.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Profile Selection */}
            <div className="bg-card p-6 rounded-lg shadow-card border border-border/20">
              <Label className="text-lg font-sport-condensed font-bold text-foreground mb-4 block">
                Choisissez votre profil
              </Label>
              <RadioGroup 
                value={formData.profile} 
                onValueChange={(value) => handleInputChange('profile', value as FormData['profile'])}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Joueur" id="joueur" />
                  <Label htmlFor="joueur" className="font-sport">Joueur</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Partenaire" id="partenaire" />
                  <Label htmlFor="partenaire" className="font-sport">Partenaire</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Common Fields */}
            {formData.profile && (
              <div className="bg-card p-6 rounded-lg shadow-card border border-border/20 space-y-6">
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

                {/* Téléphone avec indicatif + masque */}
                <div>
                  <Label className="font-sport">Téléphone (optionnel)</Label>
                  <div className="grid grid-cols-[120px,1fr] gap-2">
                    <Select
                      value={formData.phoneCountry}
                      onValueChange={(v) => setPhoneCountry(v as Country)}
                    >
                      <SelectTrigger className="font-sport">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {Object.entries(COUNTRY_META).map(([code, meta]) => (
                          <SelectItem key={code} value={code}>
                            {meta.name} ({meta.dial})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder={`${COUNTRY_META[formData.phoneCountry].dial} 6 00 00 00 00`}
                      value={formData.phone || COUNTRY_META[formData.phoneCountry].dial}
                      onChange={(e) => onPhoneChange(e.target.value)}
                      onKeyDown={(e) => {
                        // empêcher la saisie d’espace
                        if (e.key === ' ') e.preventDefault();
                      }}
                      className="font-sport"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-sport">
                    Avec indicatif, le 0 disparaît (ex. {COUNTRY_META.FR.dial} 6 12 34 56 78). {COUNTRY_META[formData.phoneCountry].digitsAfterDial} chiffres attendus après l’indicatif.
                  </p>
                </div>
              </div>
            )}

            {/* Joueur-specific fields */}
            {formData.profile === 'Joueur' && (
              <div className="bg-card p-6 rounded-lg shadow-card border border-border/20 space-y-6">
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
                    {/* z-index élevé pour éviter le dropdown derrière */}
                    <SelectContent className="z-50">
                      <div className="px-2 py-1 text-xs text-muted-foreground">Gardien de but</div>
                      <SelectItem value="Gardien de but">Gardien de but</SelectItem>

                      <div className="px-2 pt-2 text-xs text-muted-foreground">Défense</div>
                      <SelectItem value="Latéral droit">Latéral droit</SelectItem>
                      <SelectItem value="Défenseur central">Défenseur central</SelectItem>
                      <SelectItem value="Latéral gauche">Latéral gauche</SelectItem>

                      <div className="px-2 pt-2 text-xs text-muted-foreground">Milieu</div>
                      <SelectItem value="Milieu défensif">Milieu défensif</SelectItem>
                      <SelectItem value="Milieu relayeur">Milieu relayeur</SelectItem>
                      <SelectItem value="Milieu offensif">Milieu offensif</SelectItem>

                      <div className="px-2 pt-2 text-xs text-muted-foreground">Attaque</div>
                      <SelectItem value="Ailier droit">Ailier droit</SelectItem>
                      <SelectItem value="Ailier gauche">Ailier gauche</SelectItem>
                      <SelectItem value="Attaquant axial">Attaquant axial</SelectItem>
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
                    <SelectContent className="z-50">
                      <SelectItem value="reseaux">Réseaux sociaux (Instagram, Facebook, TikTok, autre)</SelectItem>
                      <SelectItem value="site">Site web</SelectItem>
                      <SelectItem value="joueurActuel">Joueur actuel (nom à préciser)</SelectItem>
                      <SelectItem value="ancienJoueur">Ancien joueur (nom à préciser)</SelectItem>
                      <SelectItem value="connaissance">Connaissance personnelle</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>

                  {(formData.referral === 'reseaux' ||
                    formData.referral === 'joueurActuel' ||
                    formData.referral === 'ancienJoueur') && (
                    <div>
                      <Label htmlFor="refDetail" className="font-sport">
                        Précisez ({formData.referral === 'reseaux' ? 'le réseau' : 'le nom'})
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

            {/* Partenaire-specific fields */}
            {formData.profile === 'Partenaire' && (
              <div className="bg-card p-6 rounded-lg shadow-card border border-border/20 space-y-6">
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

            {/* Message libre */}
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

            {/* RGPD Consent */}
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

            {/* Submit Button */}
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

          {/* Configuration info */}
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

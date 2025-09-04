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

interface FormData {
  profile: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  role: string;
  company: string;
  message: string;
  consent: boolean;
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
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.profile) errors.push("Veuillez sélectionner un profil");
    if (!formData.firstName.trim()) errors.push("Le prénom est obligatoire");
    if (!formData.lastName.trim()) errors.push("Le nom est obligatoire");
    if (!formData.email.trim()) errors.push("L'email est obligatoire");
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.push("Email invalide");
    if (!formData.consent) errors.push("Vous devez accepter les conditions");
    
    if (formData.profile === 'Joueur') {
      if (!formData.birthDate.trim()) errors.push("La date de naissance est obligatoire");
      if (!formData.role.trim()) errors.push("Veuillez sélectionner un rôle");
    }
    
    if (formData.profile === 'Partenaire') {
      if (!formData.company.trim()) errors.push("Le nom d'entreprise est obligatoire");
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
        message: formData.message,
        subject: "Nouvelle demande d'adhésion FC Ardentis",
        timestamp: new Date().toISOString()
      };

      let success = false;

      // Try Formspree first
      if (FORMSPREE_ENDPOINT) {
        try {
          const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(submitData)
          });
          success = response.ok;
        } catch (error) {
          console.error('Formspree error:', error);
        }
      }

      // Fallback to Google Apps Script
      if (!success && GAS_WEBAPP_URL) {
        try {
          const response = await fetch(GAS_WEBAPP_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
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
          birthDate: '',
          role: '',
          company: '',
          message: '',
          consent: false
        });
      } else {
        throw new Error('Tous les services sont indisponibles');
      }

    } catch (error) {
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
                onValueChange={(value) => handleInputChange('profile', value)}
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
                    <Label htmlFor="firstName" className="font-sport">
                      Prénom *
                    </Label>
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
                    <Label htmlFor="lastName" className="font-sport">
                      Nom *
                    </Label>
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
                  <Label htmlFor="email" className="font-sport">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="font-sport"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="font-sport">
                    Téléphone (optionnel)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="font-sport"
                  />
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
                  <Label htmlFor="birthDate" className="font-sport">
                    Date de naissance ou catégorie d'âge *
                  </Label>
                  <Input
                    id="birthDate"
                    type="text"
                    placeholder="ex: 15/03/1995 ou U18"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="font-sport"
                    required
                  />
                </div>

                <div>
                  <Label className="font-sport">Rôle souhaité *</Label>
                  <Select onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="font-sport">
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Joueur">Joueur</SelectItem>
                      <SelectItem value="Gardien">Gardien</SelectItem>
                      <SelectItem value="Coach">Coach</SelectItem>
                      <SelectItem value="Bénévole">Bénévole</SelectItem>
                      <SelectItem value="Partenaire">Partenaire</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="company" className="font-sport">
                    Entreprise *
                  </Label>
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
                  <Label htmlFor="supportReason" className="font-sport">
                    Pourquoi voulez-vous nous soutenir ?
                  </Label>
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
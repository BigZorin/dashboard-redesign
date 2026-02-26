"use client"

import { useState, useEffect } from "react"
import {
  User, Target, Dumbbell, Apple, Heart, Briefcase, Save,
  AlertCircle, Droplet, Flame, Moon, Pencil, X, FileText,
  Download, Loader2, RotateCcw, Upload, CheckCircle2, XCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getClientIntake, updateClientIntake, forceReIntake, getClientIntakeDocuments, getIntakeDocumentSignedUrl, ingestIntakeDocument, type IntakeFormData, type IntakeDocumentData } from "@/app/actions/clients"

// Blood work marker definitions
const BLOOD_MARKERS = [
  { key: "testosterone", label: "Testosteron", unit: "nmol/L", reference: "8.6-29" },
  { key: "free_testosterone", label: "Vrij Testosteron", unit: "pmol/L", reference: "200-620" },
  { key: "estradiol", label: "Oestradiol", unit: "pmol/L", reference: "40-160" },
  { key: "thyroid_tsh", label: "TSH", unit: "mU/L", reference: "0.4-4.0" },
  { key: "thyroid_ft4", label: "Vrij T4", unit: "pmol/L", reference: "12-22" },
  { key: "iron", label: "IJzer", unit: "\u00b5mol/L", reference: "10-30" },
  { key: "ferritin", label: "Ferritine", unit: "\u00b5g/L", reference: "30-300" },
  { key: "vitamin_d", label: "Vitamine D", unit: "nmol/L", reference: "50-125" },
  { key: "vitamin_b12", label: "Vitamine B12", unit: "pmol/L", reference: "150-700" },
  { key: "cholesterol_total", label: "Cholesterol totaal", unit: "mmol/L", reference: "<5.0" },
  { key: "cholesterol_hdl", label: "HDL", unit: "mmol/L", reference: ">1.0" },
  { key: "cholesterol_ldl", label: "LDL", unit: "mmol/L", reference: "<3.0" },
  { key: "triglycerides", label: "Triglyceriden", unit: "mmol/L", reference: "<1.7" },
  { key: "hba1c", label: "HbA1c", unit: "%", reference: "<5.7" },
  { key: "creatinine", label: "Creatinine", unit: "\u00b5mol/L", reference: "60-110" },
  { key: "cortisol", label: "Cortisol", unit: "nmol/L", reference: "170-540" },
]

// ---- Sectie wrapper ----
function IntakeSectie({ icon: Icon, titel, children }: {
  icon: React.ComponentType<{ className?: string }>
  titel: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border p-0 gap-0">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Icon className="size-4 text-primary" />
          {titel}
        </h3>
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// ---- Veld component ----
function Veld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

// ---- Display value (view mode) ----
function DisplayValue({ value, suffix }: { value: any; suffix?: string }) {
  if (value == null || value === "") return <span className="text-sm text-muted-foreground/50">&mdash;</span>
  return <span className="text-sm text-foreground">{value}{suffix ? ` ${suffix}` : ""}</span>
}

// ---- Blood work status indicator ----
function BloodStatus({ value, reference }: { value: number | null | undefined; reference: string }) {
  if (value == null) return null
  const refMatch = reference.match(/^([<>]?)(\d+\.?\d*)?(?:-(\d+\.?\d*))?$/)
  if (!refMatch) return <span className="size-2 rounded-full bg-muted-foreground/30 inline-block" />
  const [, op, low, high] = refMatch
  let inRange = true
  if (op === "<" && low) inRange = value < parseFloat(low)
  else if (op === ">" && low) inRange = value > parseFloat(low)
  else if (low && high) inRange = value >= parseFloat(low) && value <= parseFloat(high)
  return <span className={`size-2 rounded-full inline-block ${inRange ? "bg-emerald-500" : "bg-amber-500"}`} />
}

// ==== HOOFD COMPONENT ====

interface IntakeTabProps {
  clientId: string
}

export function IntakeTab({ clientId }: IntakeTabProps) {
  const [intake, setIntake] = useState<IntakeFormData | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<IntakeFormData>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isForcing, setIsForcing] = useState(false)

  // Intake documents state
  const [documents, setDocuments] = useState<IntakeDocumentData[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [ingestingIds, setIngestingIds] = useState<Set<string>>(new Set())

  // Load data
  useEffect(() => {
    if (!clientId) return
    setLoading(true)
    getClientIntake(clientId).then(result => {
      if (result.success) {
        setIntake(result.intake || null)
        setProfile(result.profile || null)
      } else {
        setError(result.error || "Kon intake niet laden")
      }
      setLoading(false)
    })
    // Fetch intake documents
    setDocsLoading(true)
    getClientIntakeDocuments(clientId).then(result => {
      if (result.success) {
        setDocuments(result.documents || [])
        // Auto-ingest pending documents
        const pending = (result.documents || []).filter(d => d.rag_status === 'pending')
        pending.forEach(doc => triggerIngestion(doc.id))
      }
      setDocsLoading(false)
    })
  }, [clientId])

  const triggerIngestion = async (docId: string) => {
    setIngestingIds(prev => new Set(prev).add(docId))
    const result = await ingestIntakeDocument(docId, clientId)
    if (result.success) {
      setDocuments(prev => prev.map(d =>
        d.id === docId ? { ...d, rag_status: 'completed' } : d
      ))
    } else {
      setDocuments(prev => prev.map(d =>
        d.id === docId ? { ...d, rag_status: 'failed' } : d
      ))
    }
    setIngestingIds(prev => {
      const next = new Set(prev)
      next.delete(docId)
      return next
    })
  }

  const handleDownloadDocument = async (doc: IntakeDocumentData) => {
    const result = await getIntakeDocumentSignedUrl(clientId, doc.storage_path)
    if (result.success && result.signedUrl) {
      window.open(result.signedUrl, '_blank')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const startEditing = () => {
    setFormData(intake ? { ...intake } : {})
    setIsEditing(true)
    setSaveError(null)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setFormData({})
    setSaveError(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    const result = await updateClientIntake(clientId, formData)
    if (result.success) {
      setIsEditing(false)
      // Reload data
      const fresh = await getClientIntake(clientId)
      if (fresh.success) {
        setIntake(fresh.intake || null)
        setProfile(fresh.profile || null)
      }
    } else {
      setSaveError(result.error || "Opslaan mislukt")
    }
    setIsSaving(false)
  }

  const handleForceReIntake = async () => {
    if (!confirm("Weet je zeker dat je de intake wilt resetten?\n\nDe client krijgt geen toegang tot de app totdat de intake opnieuw is ingevuld.")) return
    setIsForcing(true)
    const result = await forceReIntake(clientId)
    if (result.success) {
      setIntake(null)
      setIsEditing(false)
      setFormData({})
    } else {
      setSaveError(result.error || "Forceren mislukt")
    }
    setIsForcing(false)
  }

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const updateBloodMarker = (markerKey: string, field: "value" | "unit" | "reference", val: string) => {
    setFormData(prev => {
      const current = (prev.blood_work_data || {}) as Record<string, any>
      const marker = current[markerKey] || { value: null, unit: "", reference: "" }
      const defaultDef = BLOOD_MARKERS.find(m => m.key === markerKey)
      return {
        ...prev,
        blood_work_data: {
          ...current,
          [markerKey]: {
            ...marker,
            unit: marker.unit || defaultDef?.unit || "",
            reference: marker.reference || defaultDef?.reference || "",
            [field]: field === "value" ? (val ? parseFloat(val) : null) : val,
          },
        },
      }
    })
  }

  // Get current value (editing uses formData, viewing uses intake)
  const val = (key: keyof IntakeFormData): any => {
    if (isEditing) return formData[key] ?? ""
    return intake?.[key] ?? null
  }

  const handleDownloadIntake = () => {
    if (!intake) return
    const clientName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "client"
    const allFields: { label: string; key: string; suffix?: string }[] = [
      { label: "Doelen", key: "goals" },
      { label: "Doelprioriteit", key: "goal_priority" },
      { label: "Korte-termijn doelen", key: "short_term_goals" },
      { label: "Lange-termijn doelen", key: "long_term_goals" },
      { label: "Fitnesservaring", key: "fitness_experience" },
      { label: "Trainingsgeschiedenis", key: "training_history" },
      { label: "Trainingsjaren", key: "training_years" },
      { label: "Huidige trainingsfrequentie", key: "current_training_frequency", suffix: "x/week" },
      { label: "Trainingsstijl", key: "training_style" },
      { label: "Split voorkeur", key: "training_split_preference" },
      { label: "Sessieduur", key: "session_duration_minutes", suffix: "min" },
      { label: "Bench Press 1RM", key: "bench_press_1rm", suffix: "kg" },
      { label: "Squat 1RM", key: "squat_1rm", suffix: "kg" },
      { label: "Deadlift 1RM", key: "deadlift_1rm", suffix: "kg" },
      { label: "OHP 1RM", key: "ohp_1rm", suffix: "kg" },
      { label: "Favoriete oefeningen", key: "favorite_exercises" },
      { label: "Vermeden oefeningen", key: "avoided_exercises" },
      { label: "Vetpercentage", key: "body_fat_percentage", suffix: "%" },
      { label: "Nek", key: "neck_cm", suffix: "cm" },
      { label: "Schouders", key: "shoulder_cm", suffix: "cm" },
      { label: "Borst", key: "chest_cm", suffix: "cm" },
      { label: "Taille", key: "waist_cm", suffix: "cm" },
      { label: "Buik", key: "abdomen_cm", suffix: "cm" },
      { label: "Heup", key: "hip_cm", suffix: "cm" },
      { label: "Bovenarm L", key: "left_arm_cm", suffix: "cm" },
      { label: "Bovenarm R", key: "right_arm_cm", suffix: "cm" },
      { label: "Onderarm L", key: "left_forearm_cm", suffix: "cm" },
      { label: "Onderarm R", key: "right_forearm_cm", suffix: "cm" },
      { label: "Bovenbeen L", key: "left_thigh_cm", suffix: "cm" },
      { label: "Bovenbeen R", key: "right_thigh_cm", suffix: "cm" },
      { label: "Kuit L", key: "left_calf_cm", suffix: "cm" },
      { label: "Kuit R", key: "right_calf_cm", suffix: "cm" },
      { label: "Blessures", key: "injuries" },
      { label: "Medische aandoeningen", key: "medical_conditions" },
      { label: "Medicijnen", key: "medications" },
      { label: "Hormonale problemen", key: "hormonal_issues" },
      { label: "Spijsverteringsproblemen", key: "digestive_issues" },
      { label: "Eerdere operaties", key: "previous_surgeries" },
      { label: "Energieniveau", key: "energy_levels" },
      { label: "Voedingsrestricties", key: "dietary_restrictions" },
      { label: "Allergieen", key: "allergies" },
      { label: "Huidige calorie-inname", key: "current_calorie_intake", suffix: "kcal" },
      { label: "Huidige eiwitinname", key: "current_protein_intake", suffix: "g" },
      { label: "Maaltijdfrequentie", key: "meal_frequency", suffix: "x/dag" },
      { label: "Kookvaardigheden", key: "cooking_skills" },
      { label: "Voedingsbudget", key: "food_budget" },
      { label: "Waterinname", key: "water_intake_liters", suffix: "L/dag" },
      { label: "Alcoholfrequentie", key: "alcohol_frequency" },
      { label: "Cafeine-inname", key: "caffeine_intake" },
      { label: "Huidige supplementen", key: "current_supplements" },
      { label: "Dieetgeschiedenis", key: "dieting_history" },
      { label: "Eerdere dieten", key: "previous_diets" },
      { label: "Slaap", key: "sleep_hours", suffix: "uur/nacht" },
      { label: "Stressniveau", key: "stress_level", suffix: "/10" },
      { label: "Beroep", key: "occupation" },
      { label: "Dagelijkse stappen", key: "daily_steps" },
      { label: "Woon-werkverkeer", key: "commute_type" },
      { label: "Beschikbare dagen", key: "available_days" },
      { label: "Voorkeurstijd", key: "preferred_training_time" },
      { label: "Uitrusting", key: "equipment_access" },
      { label: "Motivatie", key: "motivation" },
      { label: "Eerdere coaching ervaring", key: "previous_coaching_experience" },
      { label: "Grootste uitdagingen", key: "biggest_challenges" },
      { label: "Communicatievoorkeur", key: "communication_preference" },
      { label: "Accountability voorkeur", key: "accountability_preference" },
      { label: "Opmerkingen", key: "additional_notes" },
    ]
    const lines = [
      `Intake Formulier \u2014 ${clientName}`,
      `Ingevuld op: ${intake.completed_at ? new Date(intake.completed_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : "Niet voltooid"}`,
      "",
    ]
    if (profile) {
      if (profile.gender) lines.push(`Geslacht: ${profile.gender === "FEMALE" ? "Vrouw" : profile.gender === "MALE" ? "Man" : profile.gender}`)
      if (profile.date_of_birth) lines.push(`Geboortedatum: ${new Date(profile.date_of_birth).toLocaleDateString("nl-NL")}`)
      if (profile.height_cm) lines.push(`Lengte: ${profile.height_cm} cm`)
      if (profile.current_weight_kg) lines.push(`Huidig gewicht: ${profile.current_weight_kg} kg`)
      if (profile.goal_weight_kg) lines.push(`Doelgewicht: ${profile.goal_weight_kg} kg`)
      lines.push("")
    }
    allFields.forEach(({ label, key, suffix }) => {
      const v = (intake as any)[key]
      if (v != null && v !== "" && !(Array.isArray(v) && v.length === 0)) {
        const display = Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? (v ? "Ja" : "Nee") : v
        lines.push(`${label}: ${display}${suffix ? ` ${suffix}` : ""}`)
      }
    })
    if (intake.blood_work_data && Object.keys(intake.blood_work_data).length > 0) {
      lines.push("", `Bloedwaarden (${intake.blood_work_date || "datum onbekend"}):`)
      for (const [key, data] of Object.entries(intake.blood_work_data)) {
        const d = data as any
        const def = BLOOD_MARKERS.find(m => m.key === key)
        lines.push(`  ${def?.label || key}: ${d.value} ${d.unit} (ref: ${d.reference})`)
      }
    }
    // Uploaded documents
    if (documents.length > 0) {
      lines.push("", "Geüploade documenten:")
      documents.forEach(doc => {
        const type = doc.document_type === 'trainingsschema' ? 'Training' :
                     doc.document_type === 'voedingsschema' ? 'Voeding' :
                     doc.document_type === 'bloedwaarden' ? 'Bloedwaarden' : 'Overig'
        lines.push(`  ${doc.file_name} (${type}, ${formatFileSize(doc.file_size_bytes)})`)
      })
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `intake-${clientName.replace(/\s+/g, "-").toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isFemale = profile?.gender === "FEMALE"
  const stressLabels: Record<number, string> = { 1: "Zeer laag", 2: "Laag", 3: "Laag-gemiddeld", 4: "Gemiddeld", 5: "Gemiddeld", 6: "Gemiddeld-hoog", 7: "Hoog", 8: "Hoog", 9: "Zeer hoog", 10: "Zeer hoog" }
  const bloodData = (isEditing ? formData.blood_work_data : intake?.blood_work_data) as Record<string, any> | null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Intake Formulier</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Baseline informatie &mdash; deze data wordt gebruikt door AI voor het genereren van programma{"'"}s en voedingsplannen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {intake && !isEditing && (
            <>
              <span className="text-[10px] text-muted-foreground">
                {intake.updated_at && intake.updated_at !== intake.created_at
                  ? `Bijgewerkt: ${new Date(intake.updated_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`
                  : intake.completed_at
                    ? `Ingevuld: ${new Date(intake.completed_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`
                    : ""}
              </span>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={startEditing}>
                <Pencil className="size-3.5" />
                Bewerken
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleDownloadIntake}>
                <Download className="size-3.5" />
                Download
              </Button>
              <Button size="sm" variant="destructive" className="gap-1.5 text-xs" onClick={handleForceReIntake} disabled={isForcing}>
                <RotateCcw className="size-3.5" />
                {isForcing ? "Resetten..." : "Forceer Her-intake"}
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button size="sm" className="gap-1.5 text-xs" onClick={handleSave} disabled={isSaving}>
                <Save className="size-3.5" />
                {isSaving ? "Opslaan..." : "Opslaan"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={cancelEditing}>
                Annuleren
              </Button>
            </>
          )}
          {!intake && !isEditing && (
            <Button size="sm" className="gap-1.5 text-xs" onClick={startEditing}>
              <Pencil className="size-3.5" />
              Intake invullen
            </Button>
          )}
        </div>
      </div>

      {/* Error states */}
      {error && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="size-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {saveError && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-center gap-2">
          <X className="size-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{saveError}</p>
        </div>
      )}

      {/* Empty state */}
      {!intake && !isEditing && !error && (
        <Card className="border-border p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Nog geen intake formulier ingevuld</p>
            <p className="text-xs text-muted-foreground mt-1">De client moet het intake formulier invullen, of je kunt het handmatig invullen.</p>
          </div>
        </Card>
      )}

      {/* ===== FORM SECTIONS ===== */}
      {(intake || isEditing) && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* ---- Column 1 ---- */}
          <div className="flex flex-col gap-5">
            {/* 1. Persoonlijke Gegevens */}
            <IntakeSectie icon={User} titel="Persoonlijke Gegevens">
              {/* Profile fields (read-only) */}
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Geslacht">
                  <DisplayValue value={profile?.gender === "FEMALE" ? "Vrouw" : profile?.gender === "MALE" ? "Man" : profile?.gender || null} />
                </Veld>
                <Veld label="Geboortedatum">
                  <DisplayValue value={profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("nl-NL") : null} />
                </Veld>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Veld label="Lengte">
                  <DisplayValue value={profile?.height_cm} suffix="cm" />
                </Veld>
                <Veld label="Huidig gewicht">
                  <DisplayValue value={profile?.current_weight_kg} suffix="kg" />
                </Veld>
                <Veld label="Streefgewicht">
                  <DisplayValue value={profile?.goal_weight_kg} suffix="kg" />
                </Veld>
              </div>
              {profile && !profile.gender && !profile.height_cm && (
                <p className="text-[11px] text-muted-foreground/60 italic">Profiel velden worden ingevuld via het profiel van de client</p>
              )}
              {/* Intake body measurements */}
              <div className="border-t border-border pt-3 mt-1" />
              <p className="text-xs font-medium text-muted-foreground mb-2">Lichaamsmaten (eerste meting)</p>
              <div className="grid grid-cols-3 gap-3">
                <Veld label="Vetpercentage">
                  {isEditing ? <Input type="number" step="0.1" value={val("body_fat_percentage") ?? ""} onChange={e => updateField("body_fat_percentage", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="%" /> : <DisplayValue value={val("body_fat_percentage")} suffix="%" />}
                </Veld>
                <Veld label="Nek">
                  {isEditing ? <Input type="number" step="0.1" value={val("neck_cm") ?? ""} onChange={e => updateField("neck_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("neck_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Schouders">
                  {isEditing ? <Input type="number" step="0.1" value={val("shoulder_cm") ?? ""} onChange={e => updateField("shoulder_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("shoulder_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Borst">
                  {isEditing ? <Input type="number" step="0.1" value={val("chest_cm") ?? ""} onChange={e => updateField("chest_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("chest_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Taille">
                  {isEditing ? <Input type="number" step="0.1" value={val("waist_cm") ?? ""} onChange={e => updateField("waist_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("waist_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Buik">
                  {isEditing ? <Input type="number" step="0.1" value={val("abdomen_cm") ?? ""} onChange={e => updateField("abdomen_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("abdomen_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Heup">
                  {isEditing ? <Input type="number" step="0.1" value={val("hip_cm") ?? ""} onChange={e => updateField("hip_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("hip_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Bovenarm L">
                  {isEditing ? <Input type="number" step="0.1" value={val("left_arm_cm") ?? ""} onChange={e => updateField("left_arm_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("left_arm_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Bovenarm R">
                  {isEditing ? <Input type="number" step="0.1" value={val("right_arm_cm") ?? ""} onChange={e => updateField("right_arm_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("right_arm_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Onderarm L">
                  {isEditing ? <Input type="number" step="0.1" value={val("left_forearm_cm") ?? ""} onChange={e => updateField("left_forearm_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("left_forearm_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Onderarm R">
                  {isEditing ? <Input type="number" step="0.1" value={val("right_forearm_cm") ?? ""} onChange={e => updateField("right_forearm_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("right_forearm_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Bovenbeen L">
                  {isEditing ? <Input type="number" step="0.1" value={val("left_thigh_cm") ?? ""} onChange={e => updateField("left_thigh_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("left_thigh_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Bovenbeen R">
                  {isEditing ? <Input type="number" step="0.1" value={val("right_thigh_cm") ?? ""} onChange={e => updateField("right_thigh_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("right_thigh_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Kuit L">
                  {isEditing ? <Input type="number" step="0.1" value={val("left_calf_cm") ?? ""} onChange={e => updateField("left_calf_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("left_calf_cm")} suffix="cm" />}
                </Veld>
                <Veld label="Kuit R">
                  {isEditing ? <Input type="number" step="0.1" value={val("right_calf_cm") ?? ""} onChange={e => updateField("right_calf_cm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="cm" /> : <DisplayValue value={val("right_calf_cm")} suffix="cm" />}
                </Veld>
              </div>
            </IntakeSectie>

            {/* 2. Doelstellingen */}
            <IntakeSectie icon={Target} titel="Doelstellingen">
              <Veld label="Doelen">
                {isEditing ? <Input value={val("goals") ?? ""} onChange={e => updateField("goals", e.target.value)} className="text-sm" placeholder="bijv. Afvallen, Spiermassa opbouwen" /> : <DisplayValue value={val("goals")} />}
              </Veld>
              <Veld label="Doelprioriteit">
                {isEditing ? (
                  <Select value={val("goal_priority") ?? ""} onValueChange={v => updateField("goal_priority", v || null)}>
                    <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="afvallen">Afvallen</SelectItem>
                      <SelectItem value="spiermassa">Spiermassa opbouwen</SelectItem>
                      <SelectItem value="kracht">Kracht verbeteren</SelectItem>
                      <SelectItem value="gezondheid">Algemene gezondheid</SelectItem>
                      <SelectItem value="sport_specifiek">Sport-specifiek</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <DisplayValue value={val("goal_priority")} />}
              </Veld>
              <Veld label="Korte-termijn doelen (4-8 weken)">
                {isEditing ? <Textarea value={val("short_term_goals") ?? ""} onChange={e => updateField("short_term_goals", e.target.value)} rows={2} className="text-sm resize-none" /> : <DisplayValue value={val("short_term_goals")} />}
              </Veld>
              <Veld label="Lange-termijn doelen (3-12 maanden)">
                {isEditing ? <Textarea value={val("long_term_goals") ?? ""} onChange={e => updateField("long_term_goals", e.target.value)} rows={2} className="text-sm resize-none" /> : <DisplayValue value={val("long_term_goals")} />}
              </Veld>
              <Veld label="Fitnesservaring">
                {isEditing ? (
                  <Select value={val("fitness_experience") ?? ""} onValueChange={v => updateField("fitness_experience", v || null)}>
                    <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner (0-1 jaar)</SelectItem>
                      <SelectItem value="Gemiddeld">Gemiddeld (1-3 jaar)</SelectItem>
                      <SelectItem value="Gevorderd">Gevorderd (3-5 jaar)</SelectItem>
                      <SelectItem value="Expert">Expert (5+ jaar)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <DisplayValue value={val("fitness_experience")} />}
              </Veld>
            </IntakeSectie>

            {/* 3. Training */}
            <IntakeSectie icon={Dumbbell} titel="Training">
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Trainingsjaren">
                  {isEditing ? <Input type="number" step="0.5" value={val("training_years") ?? ""} onChange={e => updateField("training_years", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" /> : <DisplayValue value={val("training_years")} suffix="jaar" />}
                </Veld>
                <Veld label="Huidige frequentie">
                  {isEditing ? <Input type="number" min={0} max={7} value={val("current_training_frequency") ?? ""} onChange={e => updateField("current_training_frequency", e.target.value ? parseInt(e.target.value) : null)} className="text-sm" placeholder="x/week" /> : <DisplayValue value={val("current_training_frequency")} suffix="x/week" />}
                </Veld>
              </div>
              <Veld label="Trainingsgeschiedenis">
                {isEditing ? <Textarea value={val("training_history") ?? ""} onChange={e => updateField("training_history", e.target.value)} rows={2} className="text-sm resize-none" /> : <DisplayValue value={val("training_history")} />}
              </Veld>
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Trainingsstijl">
                  {isEditing ? (
                    <Select value={val("training_style") ?? ""} onValueChange={v => updateField("training_style", v || null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bodybuilding">Bodybuilding</SelectItem>
                        <SelectItem value="powerlifting">Powerlifting</SelectItem>
                        <SelectItem value="crossfit">CrossFit</SelectItem>
                        <SelectItem value="calisthenics">Calisthenics</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="mixed">Gemengd</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("training_style")} />}
                </Veld>
                <Veld label="Split voorkeur">
                  {isEditing ? (
                    <Select value={val("training_split_preference") ?? ""} onValueChange={v => updateField("training_split_preference", v || null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_body">Full Body</SelectItem>
                        <SelectItem value="upper_lower">Upper/Lower</SelectItem>
                        <SelectItem value="push_pull_legs">Push/Pull/Legs</SelectItem>
                        <SelectItem value="bro_split">Bro Split</SelectItem>
                        <SelectItem value="geen_voorkeur">Geen voorkeur</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("training_split_preference")} />}
                </Veld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Sessieduur">
                  {isEditing ? <Input type="number" value={val("session_duration_minutes") ?? ""} onChange={e => updateField("session_duration_minutes", e.target.value ? parseInt(e.target.value) : null)} className="text-sm" placeholder="minuten" /> : <DisplayValue value={val("session_duration_minutes")} suffix="min" />}
                </Veld>
                <Veld label="Beschikbare uitrusting">
                  {isEditing ? <Input value={val("equipment_access") ?? ""} onChange={e => updateField("equipment_access", e.target.value)} className="text-sm" placeholder="bijv. Volledige sportschool" /> : <DisplayValue value={val("equipment_access")} />}
                </Veld>
              </div>
              <Veld label="Beschikbare trainingsdagen">
                {isEditing ? <Input value={Array.isArray(val("available_days")) ? (val("available_days") as string[]).join(", ") : val("available_days") ?? ""} onChange={e => updateField("available_days", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} className="text-sm" placeholder="Maandag, Woensdag, Vrijdag" /> : <DisplayValue value={Array.isArray(val("available_days")) ? (val("available_days") as string[]).join(", ") : val("available_days")} />}
              </Veld>
              <Veld label="Voorkeurstijd training">
                {isEditing ? (
                  <Select value={val("preferred_training_time") ?? ""} onValueChange={v => updateField("preferred_training_time", v || null)}>
                    <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ochtend">Ochtend</SelectItem>
                      <SelectItem value="Middag">Middag</SelectItem>
                      <SelectItem value="Avond">Avond</SelectItem>
                      <SelectItem value="Wisselend">Wisselend</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <DisplayValue value={val("preferred_training_time")} />}
              </Veld>
            </IntakeSectie>

            {/* 4. Krachtlevels */}
            <IntakeSectie icon={Dumbbell} titel="Krachtlevels (1RM)">
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Bench Press">
                  {isEditing ? <Input type="number" step="0.5" value={val("bench_press_1rm") ?? ""} onChange={e => updateField("bench_press_1rm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="kg" /> : <DisplayValue value={val("bench_press_1rm")} suffix="kg" />}
                </Veld>
                <Veld label="Squat">
                  {isEditing ? <Input type="number" step="0.5" value={val("squat_1rm") ?? ""} onChange={e => updateField("squat_1rm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="kg" /> : <DisplayValue value={val("squat_1rm")} suffix="kg" />}
                </Veld>
                <Veld label="Deadlift">
                  {isEditing ? <Input type="number" step="0.5" value={val("deadlift_1rm") ?? ""} onChange={e => updateField("deadlift_1rm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="kg" /> : <DisplayValue value={val("deadlift_1rm")} suffix="kg" />}
                </Veld>
                <Veld label="Overhead Press">
                  {isEditing ? <Input type="number" step="0.5" value={val("ohp_1rm") ?? ""} onChange={e => updateField("ohp_1rm", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" placeholder="kg" /> : <DisplayValue value={val("ohp_1rm")} suffix="kg" />}
                </Veld>
              </div>
              <Veld label="Favoriete oefeningen">
                {isEditing ? <Input value={val("favorite_exercises") ?? ""} onChange={e => updateField("favorite_exercises", e.target.value)} className="text-sm" /> : <DisplayValue value={val("favorite_exercises")} />}
              </Veld>
              <Veld label="Vermeden oefeningen">
                {isEditing ? <Input value={val("avoided_exercises") ?? ""} onChange={e => updateField("avoided_exercises", e.target.value)} className="text-sm" /> : <DisplayValue value={val("avoided_exercises")} />}
              </Veld>
            </IntakeSectie>
          </div>

          {/* ---- Column 2 ---- */}
          <div className="flex flex-col gap-5">
            {/* 5. Voeding */}
            <IntakeSectie icon={Apple} titel="Voeding">
              <Veld label="Voedingsrestricties">
                {isEditing ? <Input value={val("dietary_restrictions") ?? ""} onChange={e => updateField("dietary_restrictions", e.target.value)} className="text-sm" placeholder="bijv. Vegetarisch, Glutenvrij" /> : <DisplayValue value={val("dietary_restrictions")} />}
              </Veld>
              <Veld label="Allergieen">
                {isEditing ? <Input value={val("allergies") ?? ""} onChange={e => updateField("allergies", e.target.value)} className="text-sm" /> : <DisplayValue value={val("allergies")} />}
              </Veld>
              <div className="grid grid-cols-3 gap-3">
                <Veld label="Huidige kcal/dag">
                  {isEditing ? <Input type="number" value={val("current_calorie_intake") ?? ""} onChange={e => updateField("current_calorie_intake", e.target.value ? parseInt(e.target.value) : null)} className="text-sm" /> : <DisplayValue value={val("current_calorie_intake")} suffix="kcal" />}
                </Veld>
                <Veld label="Huidige eiwit/dag">
                  {isEditing ? <Input type="number" value={val("current_protein_intake") ?? ""} onChange={e => updateField("current_protein_intake", e.target.value ? parseInt(e.target.value) : null)} className="text-sm" /> : <DisplayValue value={val("current_protein_intake")} suffix="g" />}
                </Veld>
                <Veld label="Maaltijden/dag">
                  {isEditing ? <Input type="number" min={1} max={8} value={val("meal_frequency") ?? ""} onChange={e => updateField("meal_frequency", e.target.value ? parseInt(e.target.value) : null)} className="text-sm" /> : <DisplayValue value={val("meal_frequency")} suffix="x" />}
                </Veld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Kookvaardigheden">
                  {isEditing ? (
                    <Select value={val("cooking_skills") ?? ""} onValueChange={v => updateField("cooking_skills", v || null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geen">Geen</SelectItem>
                        <SelectItem value="basis">Basis</SelectItem>
                        <SelectItem value="gemiddeld">Gemiddeld</SelectItem>
                        <SelectItem value="gevorderd">Gevorderd</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("cooking_skills")} />}
                </Veld>
                <Veld label="Voedingsbudget">
                  {isEditing ? (
                    <Select value={val("food_budget") ?? ""} onValueChange={v => updateField("food_budget", v || null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laag">Laag</SelectItem>
                        <SelectItem value="gemiddeld">Gemiddeld</SelectItem>
                        <SelectItem value="hoog">Hoog</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("food_budget")} />}
                </Veld>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Veld label="Water (L/dag)">
                  {isEditing ? <Input type="number" step="0.1" value={val("water_intake_liters") ?? ""} onChange={e => updateField("water_intake_liters", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" /> : <DisplayValue value={val("water_intake_liters")} suffix="L" />}
                </Veld>
                <Veld label="Alcohol">
                  {isEditing ? (
                    <Select value={val("alcohol_frequency") ?? ""} onValueChange={v => updateField("alcohol_frequency", v || null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nooit">Nooit</SelectItem>
                        <SelectItem value="zelden">Zelden</SelectItem>
                        <SelectItem value="wekelijks">Wekelijks</SelectItem>
                        <SelectItem value="dagelijks">Dagelijks</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("alcohol_frequency")} />}
                </Veld>
                <Veld label="Cafeine">
                  {isEditing ? <Input value={val("caffeine_intake") ?? ""} onChange={e => updateField("caffeine_intake", e.target.value)} className="text-sm" placeholder="bijv. 3 koppen/dag" /> : <DisplayValue value={val("caffeine_intake")} />}
                </Veld>
              </div>
              <Veld label="Huidige supplementen">
                {isEditing ? <Textarea value={val("current_supplements") ?? ""} onChange={e => updateField("current_supplements", e.target.value)} rows={2} className="text-sm resize-none" /> : <DisplayValue value={val("current_supplements")} />}
              </Veld>
              <Veld label="Dieetgeschiedenis">
                {isEditing ? <Textarea value={val("dieting_history") ?? ""} onChange={e => updateField("dieting_history", e.target.value)} rows={2} className="text-sm resize-none" placeholder="Wat heeft eerder gewerkt / niet gewerkt?" /> : <DisplayValue value={val("dieting_history")} />}
              </Veld>
              <Veld label="Eerdere dieten">
                {isEditing ? <Input value={val("previous_diets") ?? ""} onChange={e => updateField("previous_diets", e.target.value)} className="text-sm" placeholder="bijv. Keto, IF, IIFYM" /> : <DisplayValue value={val("previous_diets")} />}
              </Veld>
            </IntakeSectie>

            {/* 6. Gezondheid */}
            <IntakeSectie icon={Heart} titel="Gezondheid">
              <Veld label="Blessures / beperkingen">
                {isEditing ? <Textarea value={val("injuries") ?? ""} onChange={e => updateField("injuries", e.target.value)} rows={2} className="text-sm resize-none" /> : <DisplayValue value={val("injuries")} />}
              </Veld>
              {!isEditing && val("injuries") && val("injuries") !== "Geen" && (
                <div className="flex items-start gap-2 rounded-md bg-warning/10 p-3 border border-warning/20">
                  <AlertCircle className="size-4 text-warning-foreground shrink-0 mt-0.5" />
                  <p className="text-[11px] text-warning-foreground">
                    Let op: blessure-informatie wordt meegenomen bij AI-generatie om oefeningen automatisch aan te passen.
                  </p>
                </div>
              )}
              <Veld label="Medische aandoeningen">
                {isEditing ? <Textarea value={val("medical_conditions") ?? ""} onChange={e => updateField("medical_conditions", e.target.value)} rows={2} className="text-sm resize-none" /> : <DisplayValue value={val("medical_conditions")} />}
              </Veld>
              <Veld label="Medicijnen">
                {isEditing ? <Input value={val("medications") ?? ""} onChange={e => updateField("medications", e.target.value)} className="text-sm" /> : <DisplayValue value={val("medications")} />}
              </Veld>
              <Veld label="Hormonale problemen">
                {isEditing ? <Input value={val("hormonal_issues") ?? ""} onChange={e => updateField("hormonal_issues", e.target.value)} className="text-sm" /> : <DisplayValue value={val("hormonal_issues")} />}
              </Veld>
              <Veld label="Spijsverteringsproblemen">
                {isEditing ? <Input value={val("digestive_issues") ?? ""} onChange={e => updateField("digestive_issues", e.target.value)} className="text-sm" /> : <DisplayValue value={val("digestive_issues")} />}
              </Veld>
              <Veld label="Eerdere operaties">
                {isEditing ? <Input value={val("previous_surgeries") ?? ""} onChange={e => updateField("previous_surgeries", e.target.value)} className="text-sm" /> : <DisplayValue value={val("previous_surgeries")} />}
              </Veld>
              <Veld label="Energieniveau">
                {isEditing ? (
                  <Select value={val("energy_levels") ?? ""} onValueChange={v => updateField("energy_levels", v || null)}>
                    <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laag">Laag</SelectItem>
                      <SelectItem value="wisselend">Wisselend</SelectItem>
                      <SelectItem value="gemiddeld">Gemiddeld</SelectItem>
                      <SelectItem value="hoog">Hoog</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <DisplayValue value={val("energy_levels")} />}
              </Veld>
            </IntakeSectie>

            {/* 7. Vrouwengezondheid (conditioneel) */}
            {(isFemale || isEditing) && (
              <IntakeSectie icon={Moon} titel="Vrouwengezondheid">
                {!isFemale && isEditing && (
                  <p className="text-[11px] text-muted-foreground/60 italic">Deze sectie is alleen relevant als geslacht = Vrouw in het profiel</p>
                )}
                <Veld label="Menstruatiecyclus regulier">
                  {isEditing ? (
                    <Select value={val("menstrual_cycle_regular") === true ? "ja" : val("menstrual_cycle_regular") === false ? "nee" : ""} onValueChange={v => updateField("menstrual_cycle_regular", v === "ja" ? true : v === "nee" ? false : null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ja">Ja</SelectItem>
                        <SelectItem value="nee">Nee</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("menstrual_cycle_regular") === true ? "Ja" : val("menstrual_cycle_regular") === false ? "Nee" : null} />}
                </Veld>
                <Veld label="Cyclus notities">
                  {isEditing ? <Textarea value={val("menstrual_cycle_notes") ?? ""} onChange={e => updateField("menstrual_cycle_notes", e.target.value)} rows={2} className="text-sm resize-none" /> : <DisplayValue value={val("menstrual_cycle_notes")} />}
                </Veld>
                <Veld label="Anticonceptie">
                  {isEditing ? <Input value={val("contraceptive_use") ?? ""} onChange={e => updateField("contraceptive_use", e.target.value)} className="text-sm" placeholder="bijv. Pil, Spiraal, Geen" /> : <DisplayValue value={val("contraceptive_use")} />}
                </Veld>
              </IntakeSectie>
            )}

            {/* 8. Leefstijl */}
            <IntakeSectie icon={Briefcase} titel="Leefstijl">
              <Veld label="Beroep">
                {isEditing ? <Input value={val("occupation") ?? ""} onChange={e => updateField("occupation", e.target.value)} className="text-sm" /> : <DisplayValue value={val("occupation")} />}
              </Veld>
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Stressniveau (1-10)">
                  {isEditing ? <Input type="number" min={1} max={10} value={val("stress_level") ?? ""} onChange={e => updateField("stress_level", e.target.value ? parseInt(e.target.value) : null)} className="text-sm" /> : <DisplayValue value={val("stress_level") != null ? `${val("stress_level")}/10 (${stressLabels[val("stress_level") as number] || ""})` : null} />}
                </Veld>
                <Veld label="Slaap (uur/nacht)">
                  {isEditing ? <Input type="number" step="0.5" min={3} max={12} value={val("sleep_hours") ?? ""} onChange={e => updateField("sleep_hours", e.target.value ? parseFloat(e.target.value) : null)} className="text-sm" /> : <DisplayValue value={val("sleep_hours")} suffix="uur" />}
                </Veld>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Dagelijkse stappen">
                  {isEditing ? <Input type="number" value={val("daily_steps") ?? ""} onChange={e => updateField("daily_steps", e.target.value ? parseInt(e.target.value) : null)} className="text-sm" /> : <DisplayValue value={val("daily_steps")} />}
                </Veld>
                <Veld label="Woon-werkverkeer">
                  {isEditing ? (
                    <Select value={val("commute_type") ?? ""} onValueChange={v => updateField("commute_type", v || null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="fiets">Fiets</SelectItem>
                        <SelectItem value="ov">OV</SelectItem>
                        <SelectItem value="lopen">Lopen</SelectItem>
                        <SelectItem value="thuis">Thuiswerken</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("commute_type")} />}
                </Veld>
              </div>
            </IntakeSectie>

            {/* 9. Motivatie & Coaching */}
            <IntakeSectie icon={Flame} titel="Motivatie & Coaching">
              <Veld label="Motivatie">
                {isEditing ? <Textarea value={val("motivation") ?? ""} onChange={e => updateField("motivation", e.target.value)} rows={2} className="text-sm resize-none" placeholder="Wat drijft deze client?" /> : <DisplayValue value={val("motivation")} />}
              </Veld>
              <Veld label="Eerdere coaching ervaring">
                {isEditing ? <Input value={val("previous_coaching_experience") ?? ""} onChange={e => updateField("previous_coaching_experience", e.target.value)} className="text-sm" /> : <DisplayValue value={val("previous_coaching_experience")} />}
              </Veld>
              <Veld label="Grootste uitdagingen">
                {isEditing ? <Textarea value={val("biggest_challenges") ?? ""} onChange={e => updateField("biggest_challenges", e.target.value)} rows={2} className="text-sm resize-none" /> : <DisplayValue value={val("biggest_challenges")} />}
              </Veld>
              <div className="grid grid-cols-2 gap-3">
                <Veld label="Communicatievoorkeur">
                  {isEditing ? (
                    <Select value={val("communication_preference") ?? ""} onValueChange={v => updateField("communication_preference", v || null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat">Chat</SelectItem>
                        <SelectItem value="bellen">Bellen</SelectItem>
                        <SelectItem value="videocall">Videocall</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("communication_preference")} />}
                </Veld>
                <Veld label="Accountability voorkeur">
                  {isEditing ? (
                    <Select value={val("accountability_preference") ?? ""} onValueChange={v => updateField("accountability_preference", v || null)}>
                      <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="streng">Streng / directief</SelectItem>
                        <SelectItem value="motiverend">Motiverend / ondersteunend</SelectItem>
                        <SelectItem value="autonoom">Autonoom / zelfstandig</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <DisplayValue value={val("accountability_preference")} />}
                </Veld>
              </div>
              <Veld label="Extra opmerkingen">
                {isEditing ? <Textarea value={val("additional_notes") ?? ""} onChange={e => updateField("additional_notes", e.target.value)} rows={3} className="text-sm resize-none" /> : <DisplayValue value={val("additional_notes")} />}
              </Veld>
            </IntakeSectie>
          </div>
        </div>
      )}

      {/* ---- 10. Bloedwaarden (full-width) ---- */}
      {(intake || isEditing) && (
        <IntakeSectie icon={Droplet} titel="Bloedwaarden">
          <Veld label="Datum bloedonderzoek">
            {isEditing ? <Input type="date" value={(isEditing ? formData.blood_work_date : intake?.blood_work_date) ?? ""} onChange={e => updateField("blood_work_date", e.target.value || null)} className="text-sm max-w-xs" /> : <DisplayValue value={intake?.blood_work_date ? new Date(intake.blood_work_date + "T00:00:00").toLocaleDateString("nl-NL") : null} />}
          </Veld>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-xs font-medium text-muted-foreground w-[180px]">Marker</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground w-[100px]">Waarde</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground w-[80px]">Eenheid</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground w-[100px]">Referentie</th>
                  <th className="w-[30px]"></th>
                </tr>
              </thead>
              <tbody>
                {BLOOD_MARKERS.map(marker => {
                  const data = bloodData?.[marker.key]
                  const hasValue = data?.value != null
                  if (!isEditing && !hasValue) return null
                  return (
                    <tr key={marker.key} className="border-b border-border/50">
                      <td className="py-2 pr-3 text-foreground">{marker.label}</td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <Input type="number" step="0.1" value={data?.value ?? ""} onChange={e => updateBloodMarker(marker.key, "value", e.target.value)} className="text-sm h-8" />
                        ) : (
                          <span className="text-foreground font-medium">{data?.value}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{data?.unit || marker.unit}</td>
                      <td className="py-2 px-3 text-muted-foreground">{data?.reference || marker.reference}</td>
                      <td className="py-2 pl-2">
                        <BloodStatus value={data?.value} reference={data?.reference || marker.reference} />
                      </td>
                    </tr>
                  )
                })}
                {!isEditing && (!bloodData || Object.keys(bloodData).every(k => bloodData[k]?.value == null)) && (
                  <tr><td colSpan={5} className="py-4 text-center text-muted-foreground/50 text-sm">Geen bloedwaarden beschikbaar</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </IntakeSectie>
      )}

      {/* ---- 11. Geüploade Documenten (full-width) ---- */}
      <IntakeSectie icon={FileText} titel="Geüploade documenten">
        {docsLoading ? (
          <div className="flex items-center gap-2 py-4 justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Laden...</span>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 py-2">
            Geen documenten geüpload door de cliënt
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-background/50">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  {doc.document_type === 'trainingsschema' ? (
                    <Dumbbell className="size-4 text-primary" />
                  ) : doc.document_type === 'voedingsschema' ? (
                    <Apple className="size-4 text-primary" />
                  ) : doc.document_type === 'bloedwaarden' ? (
                    <Droplet className="size-4 text-primary" />
                  ) : (
                    <FileText className="size-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {doc.document_type === 'trainingsschema' ? 'Training' :
                       doc.document_type === 'voedingsschema' ? 'Voeding' :
                       doc.document_type === 'bloedwaarden' ? 'Bloedwaarden' : 'Overig'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatFileSize(doc.file_size_bytes)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString('nl-NL')}
                    </span>
                    {/* RAG status indicator */}
                    {ingestingIds.has(doc.id) ? (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />
                        AI verwerkt...
                      </span>
                    ) : doc.rag_status === 'completed' ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                        <CheckCircle2 className="size-3" />
                        AI verwerkt
                      </span>
                    ) : doc.rag_status === 'failed' ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-500 cursor-pointer" onClick={() => triggerIngestion(doc.id)}>
                        <XCircle className="size-3" />
                        Mislukt — klik om opnieuw te proberen
                      </span>
                    ) : null}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => handleDownloadDocument(doc)}
                >
                  <Download className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </IntakeSectie>
    </div>
  )
}

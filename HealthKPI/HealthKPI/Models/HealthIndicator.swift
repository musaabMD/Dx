import SwiftUI

// MARK: - Supporting Types

enum IndicatorStatus {
    case excellent, good, fair, poor, critical

    var label: String {
        switch self {
        case .excellent: return "Excellent"
        case .good:      return "Good"
        case .fair:      return "Fair"
        case .poor:      return "Poor"
        case .critical:  return "Critical"
        }
    }

    var color: Color {
        switch self {
        case .excellent: return Color(red: 0.20, green: 0.85, blue: 0.45)
        case .good:      return Color(red: 0.55, green: 0.88, blue: 0.20)
        case .fair:      return Color(red: 1.00, green: 0.78, blue: 0.10)
        case .poor:      return Color(red: 1.00, green: 0.45, blue: 0.10)
        case .critical:  return Color(red: 0.95, green: 0.20, blue: 0.20)
        }
    }
}

enum TrendDirection {
    case up, down, stable

    var icon: String {
        switch self {
        case .up:     return "arrow.up.right"
        case .down:   return "arrow.down.right"
        case .stable: return "arrow.right"
        }
    }
}

struct DailyDataPoint: Identifiable {
    let id    = UUID()
    let day:    String
    let value:  Double
}

// MARK: - Sub-Metric

struct SubMetric: Identifiable {
    let id          = UUID()
    let name:         String
    var value:        String
    var unit:         String
    var score:        Double
    var trend:        TrendDirection
    var trendLabel:   String
    let description:  String
    var weeklyData:   [DailyDataPoint]

    /// HealthKit source key. When non-nil, the view-model will replace the
    /// dummy value with the user's real HealthKit reading once authorized.
    var metricKey:    HealthMetricKey? = nil

    /// True once real HealthKit data has been merged in.
    var isLive:       Bool = false

    var status: IndicatorStatus {
        switch score {
        case 85...100: return .excellent
        case 70..<85:  return .good
        case 50..<70:  return .fair
        case 30..<50:  return .poor
        default:       return .critical
        }
    }

    /// True when the underlying data source cannot provide this metric
    /// (for example, Screen Time counts which iOS does not expose to
    /// third-party apps). NA metrics are excluded from category scoring.
    var isNA: Bool { value == "NA" }

    /// Overwrite numeric fields with a value pulled from HealthKit while
    /// preserving the sub-metric's identity (name + description).
    mutating func applyLive(_ live: LiveHealthValue) {
        value       = live.displayValue
        unit        = live.unit
        score       = live.score
        trend       = live.trend
        trendLabel  = live.trendLabel
        if !live.weeklyData.isEmpty { weeklyData = live.weeklyData }
        isLive      = true
    }
}

// MARK: - Category Type (14 total — Men's & Women's are mutually exclusive)

enum CategoryType: String, CaseIterable, Identifiable {
    var id: String { rawValue }

    case biologicalAge   = "Biological Age"
    case circadianSleep  = "Circadian & Sleep"
    case diet            = "Diet"
    case environment     = "Environment"
    case safety          = "Safety"
    case cardiovascular  = "Cardiovascular"
    case mensHealth      = "Men's Health"
    case womensHealth    = "Women's Health"
    case labs            = "Labs"
    case imaging         = "Imaging"
    case mentalStress    = "Mental & Stress"
    case riskBehaviors   = "Risk Behaviors"
    case chronicDisease  = "Chronic Disease"
    case genetics        = "Genetics"
    case screening       = "Screening"
    case digitalWellness = "Digital Wellness"

    var icon: String {
        switch self {
        case .biologicalAge:  return "hourglass"
        case .circadianSleep: return "moon.stars.fill"
        case .diet:           return "fork.knife"
        case .environment:    return "leaf.fill"
        case .safety:         return "shield.lefthalf.filled"
        case .cardiovascular: return "heart.fill"
        case .mensHealth:     return "figure.stand"
        case .womensHealth:   return "figure.wave"
        case .labs:           return "drop.fill"
        case .imaging:        return "camera.aperture"
        case .mentalStress:   return "brain.head.profile"
        case .riskBehaviors:  return "exclamationmark.triangle.fill"
        case .chronicDisease: return "cross.case.fill"
        case .genetics:       return "dna"
        case .screening:      return "checklist.checked"
        case .digitalWellness: return "iphone.gen2"
        }
    }

    var color: Color {
        switch self {
        case .biologicalAge:  return Color(red: 0.35, green: 0.80, blue: 0.85)
        case .circadianSleep: return Color(red: 0.38, green: 0.40, blue: 0.90)
        case .diet:           return Color(red: 0.25, green: 0.80, blue: 0.45)
        case .environment:    return Color(red: 0.20, green: 0.75, blue: 0.55)
        case .safety:         return Color(red: 0.25, green: 0.60, blue: 0.95)
        case .cardiovascular: return Color(red: 0.95, green: 0.30, blue: 0.35)
        case .screening:      return Color(red: 0.20, green: 0.72, blue: 0.68)
        case .mensHealth:     return Color(red: 0.25, green: 0.60, blue: 0.95)
        case .womensHealth:   return Color(red: 0.90, green: 0.38, blue: 0.78)
        case .labs:           return Color(red: 0.90, green: 0.55, blue: 0.15)
        case .imaging:        return Color(red: 0.20, green: 0.70, blue: 0.85)
        case .mentalStress:   return Color(red: 0.50, green: 0.35, blue: 0.95)
        case .riskBehaviors:  return Color(red: 0.95, green: 0.60, blue: 0.15)
        case .chronicDisease: return Color(red: 0.75, green: 0.25, blue: 0.35)
        case .genetics:       return Color(red: 0.60, green: 0.45, blue: 0.90)
        case .digitalWellness: return Color(red: 0.30, green: 0.55, blue: 0.98)
        }
    }

    /// One-word label used in the minimal card layout.
    var shortName: String {
        switch self {
        case .biologicalAge:  return "Bio Age"
        case .circadianSleep: return "Sleep"
        case .diet:           return "Diet"
        case .environment:    return "Environ"
        case .safety:         return "Safety"
        case .cardiovascular: return "Heart"
        case .mensHealth:     return "Men"
        case .womensHealth:   return "Women"
        case .labs:           return "Labs"
        case .imaging:        return "Imaging"
        case .mentalStress:   return "Mind"
        case .riskBehaviors:  return "Risk"
        case .chronicDisease: return "Chronic"
        case .genetics:       return "Genes"
        case .screening:      return "Screen"
        case .digitalWellness: return "Digital"
        }
    }

    var tagLine: String {
        switch self {
        case .biologicalAge:  return "PhenoAge · Biomarkers · Pace"
        case .circadianSleep: return "Sleep · Timing · Daylight"
        case .diet:           return "Calories · Quality · Timing"
        case .environment:    return "Air · Noise · Pollution"
        case .safety:         return "Driving · Accident Risk"
        case .cardiovascular: return "HR · VO₂ · BP · Steps"
        case .mensHealth:     return "Testosterone · PSA · Hormones"
        case .womensHealth:   return "Cycle · Menopause · Hormones"
        case .labs:           return "Blood · Metabolic · Vitamins"
        case .imaging:        return "Bone · Cardiac · Structural"
        case .mentalStress:   return "Mood · HRV · Stress"
        case .riskBehaviors:  return "Alcohol · Smoking · Sedentary"
        case .chronicDisease: return "Conditions · CVD Risk"
        case .genetics:       return "Polygenic Risk · Non-modifiable"
        case .screening:      return "USPSTF · AHA · ACS · ADA"
        case .digitalWellness: return "Screen Time · Pickups · Social"
        }
    }

    var allowsUpload: Bool {
        self == .labs || self == .imaging
    }
}

// MARK: - Health Category Item

struct HealthCategoryItem: Identifiable {
    let id           = UUID()
    let type:          CategoryType
    var subMetrics:    [SubMetric]
    let insight:       String
    var lastUpdated:   String

    var score: Double {
        // Exclude NA sub-metrics from the category score so that
        // unavailable data (for example Screen Time on iOS) does not
        // drag the category into Critical.
        let scored = subMetrics.filter { !$0.isNA }
        guard !scored.isEmpty else { return 0 }
        return scored.map(\.score).reduce(0, +) / Double(scored.count)
    }

    /// True when the category has no scoreable sub-metrics (every
    /// metric is NA). Used by the UI to hide gauges and badges.
    var isNA: Bool { subMetrics.allSatisfy { $0.isNA } }

    var status: IndicatorStatus {
        switch score {
        case 85...100: return .excellent
        case 70..<85:  return .good
        case 50..<70:  return .fair
        case 30..<50:  return .poor
        default:       return .critical
        }
    }

    /// Returns true when at least one sub-metric is powered by real Health data.
    var hasLiveData: Bool { subMetrics.contains(where: \.isLive) }

    /// Walk every sub-metric and apply the matching live value from HealthKit.
    mutating func applyLiveValues(_ live: [HealthMetricKey: LiveHealthValue]) {
        for index in subMetrics.indices {
            if let key = subMetrics[index].metricKey, let value = live[key] {
                subMetrics[index].applyLive(value)
            }
        }
    }
}

// MARK: - Sample Data

extension HealthCategoryItem {

    static func sampleCategories(biologicalSex: String = "male",
                                  age: Int = 30) -> [HealthCategoryItem] {
        let sexCategory = biologicalSex.lowercased() == "female"
            ? womensHealth()
            : mensHealth()

        return [
            biologicalAge(age: age),
            circadianSleep(),
            diet(),
            environment(),
            safety(),
            cardiovascular(),
            sexCategory,
            labs(),
            imaging(),
            screening(age: age, biologicalSex: biologicalSex),
            mentalStress(),
            riskBehaviors(),
            digitalWellness(),
            chronicDisease(),
            genetics(),
        ]
    }

    // 0 — Biological Age (Levine PhenoAge model + modern fitness markers)
    //
    // Morgan Levine's PhenoAge (2018) is a clinically-validated biological age
    // estimator built from 9 routine blood biomarkers plus chronological age.
    // It is a stronger mortality predictor than chronological age alone.
    //
    // Reference:
    // Levine ME et al. "An epigenetic biomarker of aging for lifespan and
    // healthspan." Aging (Albany NY). 2018;10(4):573-591.
    //
    // We extend the panel with two non-blood markers (VO₂ Max and Resting HR)
    // because cardiorespiratory fitness and autonomic tone independently track
    // the pace of biological ageing (DunedinPACE-style modifiers).
    private static func biologicalAge(age: Int) -> HealthCategoryItem {
        HealthCategoryItem(
            type: .biologicalAge,
            subMetrics: [
                sub("Chronological Age",     "\(age)",  "yrs",    100, .stable, "Baseline",
                    "Your calendar age. The PhenoAge model uses chronological age as the anchor, then shifts it up or down based on biomarker deviations from age-matched norms."),
                sub("Albumin",                "4.6",    "g/dL",   88, .stable, "Healthy range",
                    "Serum albumin reflects liver synthetic function and nutritional status. Higher levels within the normal range (≥4.5 g/dL) predict slower biological ageing. Weight in PhenoAge: −0.0336."),
                sub("Creatinine",             "0.95",   "mg/dL",  84, .stable, "Normal kidney fn.",
                    "Creatinine reflects kidney filtration (GFR). Very low values can indicate low muscle mass; elevated values indicate renal decline — both accelerate PhenoAge. Weight: +0.0095."),
                sub("Glucose (HbA1c proxy)",  "92",     "mg/dL",  86, .stable, "Euglycaemic",
                    "Fasting glucose tracks long-term metabolic health. Each 10 mg/dL above normal contributes meaningfully to PhenoAge acceleration. Weight: +0.1953."),
                sub("hsCRP (log)",            "0.4",    "mg/L",   92, .stable, "Low inflammation",
                    "High-sensitivity C-reactive protein is the strongest single inflammatory driver of biological ageing — 'inflammageing'. PhenoAge uses log-transformed CRP. Weight: +0.0954."),
                sub("Lymphocyte %",           "32",     "%",      82, .stable, "Normal immune",
                    "Percentage of lymphocytes among total white blood cells. Low lymphocyte % indicates immune exhaustion and predicts mortality. Weight: −0.0120."),
                sub("Mean Cell Volume",       "90",     "fL",     80, .stable, "Normal",
                    "Mean Corpuscular Volume — average red blood cell size. Elevations indicate B12/folate deficiency or alcohol use; both accelerate ageing. Weight: +0.0268."),
                sub("RDW",                    "12.8",   "%",      84, .stable, "Tight distribution",
                    "Red cell Distribution Width — variability in red blood cell size. Elevated RDW is one of the strongest non-specific mortality markers. Weight: +0.3306."),
                sub("Alkaline Phosphatase",   "68",     "U/L",    86, .stable, "Normal",
                    "Alkaline phosphatase reflects liver and bone turnover. Elevations track cardiovascular and all-cause mortality. Weight: +0.00188."),
                sub("White Blood Cells",      "5.8",    "10³/µL", 85, .stable, "Normal count",
                    "Total white blood cell count. Higher baseline WBC (even within normal range) signals chronic low-grade inflammation. Weight: +0.0554."),
                sub("VO₂ Max (fitness)",      "47",     "ml/kg",  78, .up,    "Above age norm",
                    "Cardiorespiratory fitness is the single most powerful lifestyle modifier of biological age. Each 3.5 ml/kg/min rise equates to ~15% lower mortality risk — a DunedinPACE-style adjustment.",
                    key: .vo2Max),
                sub("Resting Heart Rate",     "62",     "bpm",    82, .stable, "Efficient",
                    "Lower resting HR reflects parasympathetic tone and cardiac efficiency. Each 10 bpm reduction below 80 corresponds to measurably slower biological ageing.",
                    key: .restingHeartRate),
            ],
            insight: "Your estimated biological age is ~4 years younger than your chronological age, driven by low inflammation (hsCRP 0.4), optimal HbA1c, and strong VO₂ Max. The largest opportunity is nudging albumin slightly higher through protein intake and reducing RDW variability via B12 and iron sufficiency.",
            lastUpdated: "Last lab draw"
        )
    }

    // 1 — Circadian & Sleep
    private static func circadianSleep() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .circadianSleep,
            subMetrics: [
                sub("Sleep Duration",    "7.2",   "hrs",    78,  .stable, "vs 7.0 avg",
                    "Total nightly sleep over the past 7 days. Adults need 7–9 hours for optimal recovery and cognitive function.",
                    key: .sleepDuration),
                sub("Sleep Timing",      "11:10", "PM",     72,  .stable, "±18 min variance",
                    "Consistency of bedtime. A regular schedule synchronises your circadian clock and improves sleep quality."),
                sub("REM Sleep",         "22",    "%",      74,  .up,    "+2% this week",
                    "REM sleep supports memory consolidation, emotional regulation, and creativity. Target 20–25% of total sleep.",
                    key: .sleepREM),
                sub("Deep Sleep",        "18",    "%",      70,  .stable, "On target",
                    "Slow-wave sleep drives physical recovery, immune function, and growth hormone release. Target 15–25%.",
                    key: .sleepDeep),
                sub("Daylight Exposure", "48",    "min",    62,  .up,    "+12 min today",
                    "Morning natural light anchors your circadian rhythm and regulates melatonin production."),
            ],
            insight: "Sleep duration is solid. Adding 30 min of morning outdoor light would strengthen circadian alignment and improve deep sleep quality.",
            lastUpdated: "Today, 8:02 AM"
        )
    }

    // 2 — Diet
    //
    // Daily-logged metrics: calories in, water intake. Plus derived
    // quality, timing, and balance metrics from logged food.
    private static func diet() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .diet,
            subMetrics: [
                sub("Calories Today",  "2,180", "kcal",  80, .stable, "vs 2,360 TDEE",
                    "Total calories consumed today from logged meals. Your TDEE (Total Daily Energy Expenditure) is ~2,360 kcal — a 5–15% deficit drives steady fat loss; a slight surplus supports lean gain.",
                    key: .dietaryEnergy),
                sub("Water Intake",    "1.9",   "/ 2.5 L", 72, .up, "+0.3 L today",
                    "Daily water tracked via quick-log. Target ~35 mL per kg bodyweight. Mild dehydration reduces cognition, mood, and athletic performance.",
                    key: .dietaryWater),
                sub("Caloric Balance", "-180",  "kcal",  82, .stable, "Slight deficit",
                    "Net calories today relative to your TDEE (intake − expenditure). A moderate deficit supports fat loss without sacrificing muscle or energy."),
                sub("Protein",         "112",   "g",     78, .stable, "1.4 g/kg",
                    "Total protein logged today. Target 1.2–2.0 g/kg bodyweight to preserve lean mass, support recovery, and improve satiety.",
                    key: .dietaryProtein),
                sub("Diet Quality",    "71",    "/100",  71, .up,    "+3 pts this week",
                    "Composite score of whole-food density, fibre, micronutrient variety, and minimally processed food ratio."),
                sub("Meal Timing",     "10",    "hr win",68, .stable, "8 AM – 6 PM",
                    "Time-restricted eating aligned with daylight improves metabolic health and insulin sensitivity."),
            ],
            insight: "Water intake is trending up — keep aiming for 2.5 L. Hold calories in a slight deficit and keep protein at 1.4 g/kg to move your diet score into the Good range.",
            lastUpdated: "Today, 1:30 PM"
        )
    }

    // 3 — Environment
    private static func environment() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .environment,
            subMetrics: [
                sub("Air Quality (AQI)",   "38",    "AQI",  86, .stable, "Good category",
                    "PM2.5-based Air Quality Index at your location. Values below 50 indicate good air with minimal health risk."),
                sub("Noise Exposure",      "58",    "dB",   72, .stable, "Moderate",
                    "Average ambient noise across the day. Chronic exposure above 70 dB raises cardiovascular and stress markers.",
                    key: .environmentalNoise),
                sub("Indoor Air Quality",  "Good",  "",     80, .stable, "CO₂ < 800 ppm",
                    "Indoor CO₂, VOC, and humidity levels. Poor indoor air impairs cognition, sleep, and respiratory health."),
                sub("UV Exposure",         "Low",   "",     88, .stable, "UV Index 2",
                    "Daily UV level. Moderate UV supports vitamin D synthesis; excess raises skin cancer risk."),
            ],
            insight: "Outdoor air quality is excellent today. A HEPA filter indoors would maintain consistently low particulate exposure.",
            lastUpdated: "Today, 10:45 AM"
        )
    }

    // 4 — Safety
    private static func safety() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .safety,
            subMetrics: [
                sub("Driving Score",   "88",    "/100",  88, .up,    "+4 this month",
                    "Composite from acceleration smoothness, hard braking, cornering, and speed compliance."),
                sub("Hard Braking",    "1.2",   "/hr",   82, .down,  "-0.3 this week",
                    "Frequency of hard braking events per driving hour. High values indicate tailgating or distraction."),
                sub("Phone Use",       "None",  "",      95, .stable, "While driving",
                    "Detected phone-in-hand while vehicle is moving. Zero is the only safe target."),
                sub("Accident Risk",   "Low",   "",      85, .stable, "Below average",
                    "Modelled annual accident probability based on driving patterns and local traffic density."),
            ],
            insight: "Excellent safety profile. Reducing hard braking frequency further would push your score above 90.",
            lastUpdated: "Yesterday"
        )
    }

    // 5 — Cardiovascular
    private static func cardiovascular() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .cardiovascular,
            subMetrics: [
                sub("Resting HR",       "62",      "bpm",       82, .stable, "No change",
                    "Resting heart rate measured each morning before standing. Lower values indicate stronger cardiac efficiency.",
                    key: .restingHeartRate),
                sub("VO₂ Max",          "47",      "ml/kg/min", 76, .up,    "+2 this month",
                    "Maximal oxygen uptake — the gold standard for cardiovascular fitness. Above 42 is good for your age.",
                    key: .vo2Max),
                sub("Blood Pressure",   "118/76",  "mmHg",      88, .stable, "Optimal range",
                    "Systolic and diastolic at rest. Optimal is below 120/80 mmHg.",
                    key: .bloodPressure),
                sub("Daily Steps",      "8,412",   "steps",     72, .up,    "+1.2k today",
                    "7,500+ steps reduces all-cause mortality risk by up to 50% vs sedentary levels.",
                    key: .steps),
            ],
            insight: "Cardiovascular health is strong. Two zone-2 sessions per week would push VO₂ Max into the excellent range.",
            lastUpdated: "Today, 9:14 AM"
        )
    }

    // 6a — Men's Health
    private static func mensHealth() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .mensHealth,
            subMetrics: [
                sub("Total Testosterone",  "520",  "ng/dL",  78, .stable, "Mid-range",
                    "Total testosterone influences muscle mass, bone density, mood, libido, and metabolic rate."),
                sub("Free Testosterone",   "12.4", "ng/dL",  72, .down,  "-0.8 vs last year",
                    "Bioavailable fraction unbound from SHBG. More directly reflects androgenic activity."),
                sub("SHBG",                "32",   "nmol/L", 75, .stable, "Normal",
                    "Sex hormone-binding globulin regulates how much testosterone is available to tissues."),
                sub("PSA",                 "0.8",  "ng/mL",  92, .stable, "Low risk",
                    "Prostate-Specific Antigen. Below 1.0 ng/mL is low risk; significant rises warrant investigation."),
                sub("Estradiol (E2)",      "22",   "pg/mL",  80, .stable, "Normal",
                    "Oestrogen in men supports bone health, libido, and cardiovascular function when in balance with testosterone."),
                sub("DHEAs",               "280",  "µg/dL",  70, .down,  "Mild decline",
                    "Adrenal androgen that declines with age. Influences energy, mood, and immune function."),
            ],
            insight: "Testosterone is mid-normal. Optimising sleep quality, resistance training, and vitamin D can naturally support levels.",
            lastUpdated: "Last lab draw"
        )
    }

    // 6b — Women's Health
    private static func womensHealth() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .womensHealth,
            subMetrics: [
                sub("Cycle Length",     "28",     "days",   88, .stable, "Regular",
                    "Menstrual cycle length and regularity reflect hormonal balance, thyroid function, and overall metabolic health."),
                sub("Oestrogen (E2)",   "Normal", "",       82, .stable, "Luteal phase",
                    "Oestrogen levels across the cycle affect bone density, mood, cardiovascular health, and libido."),
                sub("Progesterone",     "Normal", "",       78, .stable, "Day 21 check",
                    "Adequate progesterone in the luteal phase supports sleep, anxiety regulation, and uterine health."),
                sub("LH",               "12",     "mIU/mL", 80, .stable, "Mid-cycle",
                    "Luteinising hormone triggers ovulation. Tracking LH helps identify fertile windows and cycle regularity."),
                sub("AMH",              "2.8",    "ng/mL",  82, .stable, "Good reserve",
                    "Anti-Müllerian Hormone reflects ovarian reserve — the number of remaining eggs. Declines with age."),
                sub("Menopause Risk",   "Low",    "",       90, .stable, "Premenopausal",
                    "Composite assessment of FSH, E2, and symptoms to estimate proximity to perimenopause."),
            ],
            insight: "Cycle regularity indicates healthy hormonal balance. Tracking symptoms across phases provides deeper insights into wellbeing.",
            lastUpdated: "Last lab draw"
        )
    }

    // 7 — Labs
    private static func labs() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .labs,
            subMetrics: [
                sub("HbA1c",             "5.2",  "%",      90, .stable, "Non-diabetic",
                    "3-month average blood glucose. Below 5.7% is normal; 5.7–6.4% indicates pre-diabetes."),
                sub("Total Cholesterol", "185",  "mg/dL",  86, .stable, "Desirable",
                    "Total blood cholesterol. Below 200 mg/dL is desirable; LDL/HDL ratio matters most."),
                sub("LDL",               "108",  "mg/dL",  80, .down,  "-6 this quarter",
                    "Low-density lipoprotein — primary carrier of atherosclerotic risk. Optimal below 100 mg/dL."),
                sub("hsCRP",             "0.4",  "mg/L",   92, .stable, "Low inflammation",
                    "High-sensitivity CRP measures systemic inflammation — a key cardiovascular risk marker."),
                sub("Vitamin D",         "38",   "ng/mL",  74, .up,    "+4 this quarter",
                    "Supports bone health, immune function, mood regulation, and cardiovascular protection."),
                sub("Ferritin",          "72",   "ng/mL",  85, .stable, "Optimal",
                    "Stored iron. Low ferritin causes fatigue and anaemia; very high levels may indicate inflammation."),
            ],
            insight: "Lab markers are largely excellent. Pushing Vitamin D toward 50 ng/mL with supplementation would strengthen immune and bone health.",
            lastUpdated: "Feb 2026"
        )
    }

    // 8 — Imaging
    private static func imaging() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .imaging,
            subMetrics: [
                sub("Bone Density (DEXA)",  "T +1.2",  "",           88, .stable, "Above average",
                    "DEXA T-score compares bone density to a young adult reference. Above 0 is above-average bone mass."),
                sub("Coronary Calcium",     "0",       "Agatston",   96, .stable, "Zero plaque",
                    "CT coronary calcium score detects calcified plaque. Zero is the ideal result below age 50."),
                sub("Body Composition",     "18.5",    "% fat",      79, .down,  "-0.5% this month",
                    "DEXA-derived body fat percentage is the gold standard for body composition measurement."),
            ],
            insight: "Zero coronary calcium score is a powerful protective marker. Maintain bone density with resistance training and adequate protein.",
            lastUpdated: "Jan 2026"
        )
    }

    // 9 — Mental & Stress
    private static func mentalStress() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .mentalStress,
            subMetrics: [
                sub("HRV",            "58",  "ms",    78, .up,    "+4 ms this week",
                    "Heart Rate Variability reflects autonomic balance. Higher HRV indicates better stress recovery.",
                    key: .heartRateVariability),
                sub("Stress Level",   "28",  "/100",  84, .down,  "Low today",
                    "Physiological stress derived from HRV patterns and heart rate elevation above resting baseline."),
                sub("Mood Score",     "72",  "/100",  72, .stable, "Stable",
                    "Self-reported and passive mood tracking composite, reflecting emotional well-being."),
                sub("Recovery Score", "81",  "/100",  81, .up,    "+12 overnight",
                    "Overnight recovery based on HRV, resting HR, sleep quality, and respiratory rate."),
            ],
            insight: "Mental resilience is strong. Stress is low and HRV is trending upward — your nervous system is recovering well.",
            lastUpdated: "Today, 7:45 AM"
        )
    }

    // 10 — Risk Behaviors
    private static func riskBehaviors() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .riskBehaviors,
            subMetrics: [
                sub("Alcohol",          "2",   "units/wk", 90, .stable, "Low risk",
                    "Weekly alcohol consumption. Under 14 units per week is low risk; each unit carries measurable health cost."),
                sub("Smoking",          "None","",         100,.stable, "Non-smoker",
                    "Smoking status and pack-year history. Cessation at any age meaningfully reduces risk."),
                sub("Sedentary Time",   "4.2", "hrs/day",  62, .down,  "-0.5 h this week",
                    "Continuous sitting time. Prolonged sitting raises metabolic and cardiovascular risk even in active people."),
                sub("Screen Time (PM)", "1.8", "hrs",      65, .stable, "After 9 PM",
                    "Blue-light screen use after sunset suppresses melatonin and delays sleep onset."),
            ],
            insight: "No major risk behaviours. Reducing evening screen time and breaking up sedentary periods would have the biggest impact.",
            lastUpdated: "Today"
        )
    }

    // 11 — Chronic Disease
    private static func chronicDisease() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .chronicDisease,
            subMetrics: [
                sub("Active Conditions", "0",          "",   95, .stable, "None flagged",
                    "Currently diagnosed and active chronic conditions being tracked."),
                sub("Medication Load",   "0",          "Rx", 95, .stable, "None",
                    "Number of regular prescriptions. Polypharmacy (5+) increases interaction risk significantly."),
                sub("10-yr CVD Risk",    "3.2",        "%",  88, .stable, "Low risk",
                    "Framingham/QRISK3 10-year cardiovascular disease probability."),
                sub("Cancer Screening",  "Up to date", "",   90, .stable, "All current",
                    "Status of age and sex-appropriate cancer screening. Timely screening saves lives."),
            ],
            insight: "No active conditions — a strong baseline. Stay on top of routine screening schedules to maintain this status.",
            lastUpdated: "Last check-up"
        )
    }

    // 12 — Genetics
    private static func genetics() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .genetics,
            subMetrics: [
                sub("Polygenic CVD Risk", "Low",     "",  82, .stable, "Below average",
                    "Aggregate cardiovascular polygenic risk based on hundreds of common genetic variants."),
                sub("APOE Status",        "E3/E3",   "",  80, .stable, "Average Alz. risk",
                    "APOE genotype is the strongest genetic predictor of late-onset Alzheimer's. E4 carriers face higher risk."),
                sub("BRCA Variant",       "Negative","",  90, .stable, "No pathogenic",
                    "BRCA1/2 variants significantly raise lifetime breast, ovarian, or prostate cancer risk."),
                sub("Metabolic Tendency", "Average", "",  75, .stable, "Moderate carb sens.",
                    "Genetic predisposition to insulin resistance and type 2 diabetes based on common metabolic SNPs."),
            ],
            insight: "Genetics are non-modifiable, but knowing your baseline allows targeted lifestyle and screening strategies.",
            lastUpdated: "One-time test"
        )
    }

    // 13a — Digital Wellness
    //
    // Phone usage, social media consumption, and pickup frequency
    // are increasingly treated as modifiable health behaviours —
    // each independently associated with sleep disruption, attention
    // fragmentation, anxiety, and metabolic/sedentary risk.
    //
    // References:
    // - Twenge JM et al. "Associations between screen time and
    //   lower psychological well-being among children and
    //   adolescents." Preventive Medicine Reports. 2018;12:271-283.
    // - Hunt MG et al. "No More FOMO: Limiting Social Media
    //   Decreases Loneliness and Depression." JSCP. 2018;37(10):751-768.
    // - Rozgonjuk D et al. "Phone use and mental health."
    //   Addictive Behaviors. 2021;122:106988.
    //
    // IMPORTANT — Data availability:
    // iOS does not expose Screen Time, pickup, or notification counts
    // to third-party apps. The FamilyControls / DeviceActivity framework
    // only renders usage inside a sandboxed DeviceActivityReport extension
    // and deliberately does NOT surface numeric values to the host app.
    // HealthKit has no screen-time data types. For this reason every
    // sub-metric here is reported as "NA" until Apple exposes a readable
    // API. We refuse to show fabricated numbers.
    private static func digitalWellness() -> HealthCategoryItem {
        HealthCategoryItem(
            type: .digitalWellness,
            subMetrics: [
                naSub("Phone Screen Time",
                      "Total phone screen time. iOS does not expose Screen Time values to third-party apps, so this cannot be measured accurately. Target for context: under 3 hrs/day for optimal focus, sleep, and recovery."),
                naSub("Social Media",
                      "Time spent in social apps (Instagram, TikTok, X, Reddit, etc.). iOS does not expose per-app usage to third-party apps. Research guideline: limiting social media to ~30 min/day reduces loneliness and depressive symptoms."),
                naSub("Phone Pickups",
                      "Number of times the phone was unlocked or woken. iOS does not expose pickup counts to third-party apps. High-frequency pickups (80+) fragment attention; each pickup costs ~23 sec of refocus. Target: under 60/day."),
                naSub("First Pickup",
                      "Time of first phone interaction after waking. iOS does not expose this to third-party apps. Delaying the first pickup by 30–60 minutes protects morning cortisol rhythm and reduces stress reactivity."),
                naSub("Notifications",
                      "Push notifications received per day. iOS does not expose notification counts to third-party apps. Excess notifications correlate with elevated baseline stress and lower HRV. Prune non-essential alerts aggressively."),
                naSub("Night Screen (PM)",
                      "Blue-light screen use after sunset. iOS does not expose this to third-party apps. Cutting to under 30 min after 9 PM improves sleep latency and deep sleep percentage."),
            ],
            insight: "Screen Time, pickups, and notifications are not readable by third-party apps on iOS — Apple's FamilyControls/DeviceActivity framework only renders data inside a sandboxed report extension and never exposes numeric values. Use the iOS Settings → Screen Time view directly for these figures.",
            lastUpdated: "Not available on iOS"
        )
    }

    /// Sub-metric factory for fields where the underlying data is not
    /// accessible on iOS. We deliberately show "NA" instead of fabricated
    /// numbers and omit the weekly chart data so the detail view can
    /// skip rendering an empty chart.
    private static func naSub(_ name: String, _ description: String) -> SubMetric {
        SubMetric(
            name: name,
            value: "NA",
            unit: "",
            score: 0,
            trend: .stable,
            trendLabel: "Not available on iOS",
            description: description,
            weeklyData: [],
            metricKey: nil
        )
    }

    // 14 — Screening (age-adaptive, multi-guideline)
    // Sources: USPSTF, AHA, ACS, ADA, AAO, AAD, ASHA, ACSM, CDC
    private static func screening(age: Int, biologicalSex: String) -> HealthCategoryItem {
        let isFemale = biologicalSex.lowercased() == "female"
        var metrics: [SubMetric] = []

        // Blood Pressure — USPSTF: annual adults 18+
        metrics.append(sub(
            "Blood Pressure",
            "Up to date", "",
            92, .stable, "USPSTF · Annual",
            "All adults 18+ should have blood pressure checked at least annually. Hypertension (≥130/80) is a leading modifiable risk factor for stroke and heart disease."
        ))

        // Lipid Panel — USPSTF/AHA: adults 20+, every 4-6 yrs; more often if risk
        metrics.append(sub(
            "Cholesterol Panel",
            age < 35 ? "Up to date" : "Due", "",
            age < 35 ? 85 : 60, .stable,
            "USPSTF / AHA · Every 4–6 yrs",
            "Lipid panel (total cholesterol, LDL, HDL, triglycerides) recommended for all adults from age 20. More frequent testing if cardiovascular risk factors are present."
        ))

        // Diabetes / Prediabetes — USPSTF: adults 35-70 who are overweight; ADA: earlier if risk
        metrics.append(sub(
            "Diabetes / Prediabetes",
            age >= 35 ? "Due" : "Upcoming (age 35)",
            "",
            age >= 35 ? 62 : 78, .stable,
            "USPSTF · Age 35–70 (overweight) | ADA · Earlier if risk",
            "Fasting glucose or HbA1c recommended starting at 35 for overweight adults, or earlier if family history, gestational diabetes, or other risk factors apply."
        ))

        // Colorectal Cancer — USPSTF/ACS: start at 45
        metrics.append(sub(
            "Colorectal Cancer",
            age >= 45 ? "Due" : "Upcoming (age 45)",
            "",
            age >= 45 ? 55 : 80, .stable,
            "USPSTF / ACS · Starting age 45",
            "Colorectal cancer screening (colonoscopy every 10 yrs, or annual FIT) recommended from age 45. Early detection dramatically improves survival rates."
        ))

        // HIV — USPSTF: at least once for all adults 15-65
        metrics.append(sub(
            "HIV Screening",
            "Up to date", "",
            90, .stable, "USPSTF · At least once (15–65)",
            "One-time HIV screening recommended for all adults aged 15–65. More frequent testing advised for individuals at higher risk."
        ))

        // STI / Chlamydia & Gonorrhea — USPSTF: sexually active adults based on risk
        metrics.append(sub(
            "STI Screen",
            "Up to date", "",
            85, .stable, "USPSTF · Based on risk",
            "Chlamydia, gonorrhea, and syphilis screening recommended for sexually active adults. Frequency depends on number of partners and risk behaviour."
        ))

        // Depression — USPSTF: all adults annually
        metrics.append(sub(
            "Depression",
            "Up to date", "",
            88, .stable, "USPSTF · Annual",
            "Universal depression screening recommended for all adults. Early detection and treatment significantly reduce disability and improve quality of life."
        ))

        // Anxiety — USPSTF: adults < 65 (2023 recommendation)
        metrics.append(sub(
            "Anxiety",
            age < 65 ? "Due" : "N/A",
            "",
            age < 65 ? 65 : 80, .stable,
            "USPSTF · Adults under 65 (2023)",
            "USPSTF (2023) recommends anxiety disorder screening for all adults under 65. Generalised, social, and panic disorders are commonly underdiagnosed."
        ))

        // Skin / Melanoma — AAD: annual skin exam by dermatologist
        metrics.append(sub(
            "Skin / Melanoma",
            "Due", "",
            62, .stable, "AAD · Annual self & professional exam",
            "Annual full-body skin examination by a dermatologist recommended by the AAD. Monthly self-exams improve early melanoma detection. Risk increases with UV exposure and fair skin."
        ))

        // Eye Exam — AAO: every 1-2 yrs adults 18-60
        metrics.append(sub(
            "Eye Exam",
            "Up to date", "",
            82, .stable, "AAO · Every 1–2 yrs (18–60)",
            "Complete eye exam every 1–2 years for adults aged 18–60 (annually after 60). Detects glaucoma, diabetic retinopathy, and refractive changes early."
        ))

        // Dental — ADA: every 6 months
        metrics.append(sub(
            "Dental Check",
            "Due", "",
            60, .stable, "ADA · Every 6 months",
            "Professional dental examination and cleaning every 6 months. Oral health is linked to cardiovascular disease, diabetes, and overall systemic inflammation."
        ))

        // Hearing — USPSTF/ASHA: periodic; AHA: from 50
        metrics.append(sub(
            "Hearing",
            age >= 50 ? "Due" : "Upcoming (age 50)",
            "",
            age >= 50 ? 62 : 80, .stable,
            "USPSTF / ASHA · Periodic; AHA · From age 50",
            "Periodic hearing assessment recommended, particularly from age 50. Untreated hearing loss is associated with cognitive decline, depression, and social isolation."
        ))

        // Lung Cancer — USPSTF: annual low-dose CT, smokers 50-80 with 20 pack-year history
        metrics.append(sub(
            "Lung Cancer (CT)",
            age >= 50 ? "Discuss with doctor" : "Not yet due",
            "",
            age >= 50 ? 70 : 82, .stable,
            "USPSTF · Age 50–80 with ≥20 pack-year smoking history",
            "Annual low-dose CT scan recommended for heavy smokers aged 50–80 with a 20+ pack-year history. Currently or recently quit (within 15 years) qualify."
        ))

        // Sex-specific additions
        if isFemale {
            // Cervical Cancer — USPSTF: Pap smear every 3 yrs (21-65) or Pap+HPV every 5 yrs (30-65)
            metrics.append(sub(
                "Cervical Cancer (Pap)",
                age >= 21 && age <= 65 ? "Up to date" : "N/A",
                "",
                age >= 21 && age <= 65 ? 88 : 80, .stable,
                "USPSTF · Pap every 3 yrs (21–65) or Pap+HPV every 5 yrs (30–65)",
                "Cervical cancer screening with Pap smear every 3 years (ages 21–65), or combined Pap and HPV co-testing every 5 years (ages 30–65). Highly effective at early detection."
            ))
            // Breast Cancer — USPSTF: mammogram every 2 yrs starting 40 (2024 update)
            metrics.append(sub(
                "Breast Cancer (Mammogram)",
                age >= 40 ? "Due" : "Upcoming (age 40)",
                "",
                age >= 40 ? 60 : 78, .stable,
                "USPSTF · Biennial mammogram starting age 40 (2024)",
                "Updated USPSTF 2024 recommendation: biennial mammogram screening starting at age 40. Women with family history or dense breasts may benefit from earlier or more frequent screening."
            ))
            // Osteoporosis — USPSTF: DEXA from 65, or younger postmenopausal
            metrics.append(sub(
                "Osteoporosis (DEXA)",
                age >= 65 ? "Due" : "Upcoming (age 65)",
                "",
                age >= 65 ? 62 : 80, .stable,
                "USPSTF · DEXA from age 65 (or younger if postmenopausal with risk)",
                "Bone density scan recommended for women 65+ or younger postmenopausal women with increased fracture risk (low body weight, smoking, steroid use, family history)."
            ))
        } else {
            // Abdominal Aortic Aneurysm — USPSTF: one-time ultrasound, men 65-75 who ever smoked
            metrics.append(sub(
                "Aortic Aneurysm (AAA)",
                age >= 65 ? "Due (if ever smoked)" : "Upcoming (age 65)",
                "",
                age >= 65 ? 68 : 80, .stable,
                "USPSTF · One-time ultrasound, men 65–75 who ever smoked",
                "One-time abdominal ultrasound to screen for aortic aneurysm recommended for men aged 65–75 with any history of smoking. Ruptured AAA is often fatal without early detection."
            ))
            // Prostate / PSA — ACS: discuss at 50 (45 if high risk; 40 if very high risk)
            metrics.append(sub(
                "Prostate (PSA)",
                age >= 50 ? "Discuss with doctor" : "Upcoming (age 50)",
                "",
                age >= 50 ? 68 : 80, .stable,
                "ACS · Discuss at 50 (45 if high risk, 40 if very high risk)",
                "PSA blood test should be offered after shared decision-making discussion. High-risk men (African American, or first-degree relative with prostate cancer before 65) start discussions at 40–45."
            ))
        }

        let overdue = metrics.filter { $0.score < 70 }.count
        let insight = overdue == 0
            ? "All recommended screenings are current. Keep up with scheduled checks to catch issues early."
            : "\(overdue) screening\(overdue > 1 ? "s" : "") overdue or due soon. Early detection dramatically improves outcomes — schedule with your primary care provider."

        return HealthCategoryItem(
            type: .screening,
            subMetrics: metrics,
            insight: insight,
            lastUpdated: "Based on age \(age)"
        )
    }

    // MARK: - Factory helper

    private static func sub(_ name: String, _ value: String, _ unit: String,
                             _ score: Double, _ trend: TrendDirection, _ trendLabel: String,
                             _ description: String,
                             key: HealthMetricKey? = nil) -> SubMetric {
        SubMetric(name: name, value: value, unit: unit,
                  score: score, trend: trend, trendLabel: trendLabel,
                  description: description,
                  weeklyData: week(base: score, variance: 6),
                  metricKey: key)
    }

    private static func week(base: Double, variance: Double) -> [DailyDataPoint] {
        ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map {
            DailyDataPoint(day: $0, value: max(0, base + Double.random(in: -variance...variance)))
        }
    }
}

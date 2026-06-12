import SwiftUI
import CoreLocation
import Combine
import AudioToolbox

// MARK: - Root

struct ContentView: View {
    @AppStorage("app_language") private var appLanguageRaw = AppLanguage.ar.rawValue

    private var lang: AppLanguage {
        AppLanguage(rawValue: appLanguageRaw) ?? .ar
    }

    var body: some View {
        TabView {
            NavigationStack {
                TodayView()
            }
            .tabItem {
                Label(lang.text(ar: "اليوم", en: "Today"), systemImage: "sun.max.fill")
            }

            NavigationStack {
                QuranLibraryView()
            }
            .tabItem {
                Label(lang.text(ar: "القرآن", en: "Quran"), systemImage: "book.closed.fill")
            }

            NavigationStack {
                AthkarView()
            }
            .tabItem {
                Label(lang.text(ar: "الأذكار", en: "Athkar"), systemImage: "sparkles.rectangle.stack.fill")
            }

            NavigationStack {
                SebhaView()
            }
            .tabItem {
                Label(lang.text(ar: "السبحة", en: "Sebha"), systemImage: "circle.dotted.circle.fill")
            }
        }
        .id(appLanguageRaw)
        .tint(AppTheme.accent)
        .toolbarBackground(AppTheme.tabBarBackground, for: .tabBar)
        .toolbarBackground(.visible, for: .tabBar)
        .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
        .environment(\.locale, Locale(identifier: lang.rawValue))
        .preferredColorScheme(.light)
    }
}

// MARK: - Today

private struct TodayView: View {
    @AppStorage("check_fajr")          private var fajr         = false
    @AppStorage("check_duha")          private var duha         = false
    @AppStorage("check_dhuhr")         private var dhuhr        = false
    @AppStorage("check_asr")           private var asr          = false
    @AppStorage("check_maghrib")       private var maghrib      = false
    @AppStorage("check_isha")          private var isha         = false
    @AppStorage("check_quran")         private var quran        = false
    @AppStorage("check_morning_athkar") private var morningAthkar = false
    @AppStorage("check_evening_athkar") private var eveningAthkar = false
    @AppStorage("check_witr")          private var witr         = false
    @AppStorage("app_language")        private var appLanguageRaw = AppLanguage.ar.rawValue
    @State private var showSettings = false
    @State private var prayerTimes = PrayerTimeCalculator.todayTimes(for: nil)

    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }
    private var doneCount: Int {
        [fajr, duha, dhuhr, asr, maghrib, isha, quran, morningAthkar, eveningAthkar, witr]
            .filter(\.self).count
    }
    private var doneProgress: Double { Double(doneCount) / 10.0 }
    private var nextPrayer: PrayerTime? {
        prayerTimes.sorted(by: { $0.date < $1.date }).first(where: { $0.date >= Date() }) ?? prayerTimes.first
    }
    private var tasks: [TodayTaskBinding] {
        [
            .init(id: "fajr", title: lang.text(ar: "صلاة الفجر", en: "Fajr Prayer"), icon: "sunrise.fill", isDone: $fajr),
            .init(id: "duha", title: lang.text(ar: "صلاة الضحى", en: "Duha Prayer"), icon: "sun.max.fill", isDone: $duha),
            .init(id: "dhuhr", title: lang.text(ar: "صلاة الظهر", en: "Dhuhr Prayer"), icon: "sun.haze.fill", isDone: $dhuhr),
            .init(id: "asr", title: lang.text(ar: "صلاة العصر", en: "Asr Prayer"), icon: "sun.and.horizon.fill", isDone: $asr),
            .init(id: "maghrib", title: lang.text(ar: "صلاة المغرب", en: "Maghrib Prayer"), icon: "sunset.fill", isDone: $maghrib),
            .init(id: "isha", title: lang.text(ar: "صلاة العشاء", en: "Isha Prayer"), icon: "moon.stars.fill", isDone: $isha),
            .init(id: "witr", title: lang.text(ar: "صلاة الوتر", en: "Witr Prayer"), icon: "moon.fill", isDone: $witr),
            .init(id: "quran", title: lang.text(ar: "ورد القرآن", en: "Quran Reading"), icon: "book.pages.fill", isDone: $quran),
            .init(id: "morning_athkar", title: lang.text(ar: "أذكار الصباح", en: "Morning Athkar"), icon: "sparkles", isDone: $morningAthkar),
            .init(id: "evening_athkar", title: lang.text(ar: "أذكار المساء", en: "Evening Athkar"), icon: "sparkles", isDone: $eveningAthkar)
        ]
    }

    var body: some View {
        ZStack {
            TodayWeatherBackdrop()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 14) {
                    TodayWeatherHeroCard(
                        lang: lang,
                        doneCount: doneCount,
                        progress: doneProgress,
                        nextPrayer: nextPrayer
                    )
                    TodayPrayerTimelineCard(prayerTimes: prayerTimes, lang: lang)
                    TodayTaskBoardCard(lang: lang, tasks: tasks, doneCount: doneCount)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle(lang.text(ar: "اليوم", en: "Today"))
        .navigationBarTitleDisplayMode(.large)
        .onAppear {
            prayerTimes = PrayerTimeCalculator.todayTimes(for: nil)
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showSettings = true } label: {
                    Image(systemName: "gearshape.fill")
                        .foregroundStyle(AppTheme.accent)
                }
            }
        }
        .sheet(isPresented: $showSettings) {
            NavigationStack {
                SettingsView(appLanguageRaw: $appLanguageRaw)
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button(lang.text(ar: "تم", en: "Done")) {
                                showSettings = false
                            }
                            .fontWeight(.semibold)
                            .foregroundStyle(AppTheme.accent)
                        }
                    }
            }
            .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
        }
        .environment(\.layoutDirection, .rightToLeft)
    }
}

private struct TodayWeatherBackdrop: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.19, green: 0.39, blue: 0.72),
                    Color(red: 0.39, green: 0.66, blue: 0.90),
                    Color(red: 0.76, green: 0.88, blue: 0.98)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            Circle()
                .fill(Color.white.opacity(0.26))
                .frame(width: 270, height: 270)
                .blur(radius: 2)
                .offset(x: 130, y: -260)

            Circle()
                .fill(Color.white.opacity(0.2))
                .frame(width: 220, height: 220)
                .blur(radius: 4)
                .offset(x: -160, y: -130)

            Circle()
                .fill(Color.white.opacity(0.16))
                .frame(width: 320, height: 320)
                .blur(radius: 10)
                .offset(x: 110, y: 320)
        }
    }
}

private struct TodayWeatherHeroCard: View {
    let lang: AppLanguage
    let doneCount: Int
    let progress: Double
    let nextPrayer: PrayerTime?

    var body: some View {
        VStack(alignment: .trailing, spacing: 14) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "cloud.sun.fill")
                    .font(.system(size: 34, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.95))
                Spacer()
                VStack(alignment: .trailing, spacing: 5) {
                    Text(lang.text(ar: "لوحة اليوم", en: "Today Dashboard"))
                        .font(.system(size: 31, weight: .black, design: .rounded))
                        .foregroundStyle(.white)
                    Text(
                        nextPrayer.map { prayer in
                            lang.text(
                                ar: "الصلاة القادمة: \(prayer.name) \(prayer.displayTime(locale: lang.locale))",
                                en: "Next prayer: \(prayer.name) \(prayer.displayTime(locale: lang.locale))"
                            )
                        } ?? lang.text(ar: "لا يوجد وقت صلاة متاح", en: "No prayer time available")
                    )
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.92))
                }
            }

            ProgressView(value: progress)
                .tint(.white)
                .scaleEffect(y: 1.5, anchor: .center)

            HStack {
                Text("\(Int(progress * 100))%")
                    .font(.title3.weight(.black))
                    .foregroundStyle(.white)
                    .monospacedDigit()
                Spacer()
                Text(lang.text(ar: "المهام المكتملة \(doneCount) / ١٠", en: "Tasks done \(doneCount) / 10"))
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.96))
            }
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: [
                    Color.white.opacity(0.3),
                    Color(red: 0.32, green: 0.56, blue: 0.85).opacity(0.42)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 26, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .stroke(Color.white.opacity(0.35), lineWidth: 1)
        )
    }
}

private struct TodayPrayerTimelineCard: View {
    let prayerTimes: [PrayerTime]
    let lang: AppLanguage

    private var upcomingID: UUID? {
        prayerTimes.sorted(by: { $0.date < $1.date }).first(where: { $0.date >= Date() })?.id
    }

    var body: some View {
        VStack(alignment: .trailing, spacing: 8) {
            Text(lang.text(ar: "مواقيت الصلاة", en: "Prayer Times"))
                .font(.title3.weight(.bold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, alignment: .trailing)

            ForEach(Array(prayerTimes.enumerated()), id: \.element.id) { index, prayer in
                HStack(spacing: 12) {
                    if lang.isRTL {
                        HStack(spacing: 8) {
                            if prayer.id == upcomingID {
                                Text(lang.text(ar: "القادمة", en: "Next"))
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(Color(red: 0.17, green: 0.40, blue: 0.70))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.white, in: Capsule())
                            }
                            Text(prayer.name)
                                .font(.headline.weight(.bold))
                                .foregroundStyle(.white)
                        }
                        .frame(maxWidth: .infinity, alignment: .trailing)

                        Text(prayer.displayTime(locale: lang.locale))
                            .font(.system(size: 20, weight: .black, design: .rounded))
                            .monospacedDigit()
                            .foregroundStyle(.white)
                    } else {
                        Text(prayer.displayTime(locale: lang.locale))
                            .font(.system(size: 20, weight: .black, design: .rounded))
                            .monospacedDigit()
                            .foregroundStyle(.white)

                        HStack(spacing: 8) {
                            if prayer.id == upcomingID {
                                Text(lang.text(ar: "القادمة", en: "Next"))
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(Color(red: 0.17, green: 0.40, blue: 0.70))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.white, in: Capsule())
                            }
                            Text(prayer.name)
                                .font(.headline.weight(.bold))
                                .foregroundStyle(.white)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding(.vertical, 5)

                if index < prayerTimes.count - 1 {
                    Divider().overlay(Color.white.opacity(0.22))
                }
            }
        }
        .padding(18)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.white.opacity(0.28), lineWidth: 1)
        )
    }
}

private struct TodayTaskBoardCard: View {
    let lang: AppLanguage
    let tasks: [TodayTaskBinding]
    let doneCount: Int

    private var percent: Int { Int((Double(doneCount) / 10.0) * 100.0) }

    var body: some View {
        VStack(alignment: .trailing, spacing: 12) {
            HStack {
                Text("\(percent)%")
                    .font(.title2.weight(.black))
                    .foregroundStyle(.white)
                    .monospacedDigit()
                Spacer()
                Text(lang.text(ar: "مهام اليوم", en: "Today's Tasks"))
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
            }

            ForEach(tasks) { task in
                TodayChecklistWeatherRow(task: task)
            }
        }
        .padding(18)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.white.opacity(0.28), lineWidth: 1)
        )
    }
}

private struct TodayTaskBinding: Identifiable {
    let id: String
    let title: String
    let icon: String
    var isDone: Binding<Bool>
}

private struct TodayChecklistWeatherRow: View {
    let task: TodayTaskBinding

    var body: some View {
        Button {
            withAnimation(.spring(duration: 0.25)) { task.isDone.wrappedValue.toggle() }
        } label: {
            HStack(spacing: 12) {
                Image(systemName: task.isDone.wrappedValue ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(task.isDone.wrappedValue ? .white : Color.white.opacity(0.7))

                Text(task.title)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(task.isDone.wrappedValue ? .white.opacity(0.65) : .white)
                    .strikethrough(task.isDone.wrappedValue, color: .white.opacity(0.6))
                    .frame(maxWidth: .infinity, alignment: .trailing)

                Image(systemName: task.icon)
                    .font(.body)
                    .foregroundStyle(task.isDone.wrappedValue ? .white.opacity(0.55) : .white.opacity(0.95))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(task.isDone.wrappedValue ? Color.white.opacity(0.15) : Color.white.opacity(0.22))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(Color.white.opacity(0.24), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Prayer Times

private struct PrayerTimesView: View {
    @StateObject private var locationManager = LocationManager()
    @State private var prayerTimes = PrayerTimeCalculator.todayTimes(for: nil)
    @AppStorage("app_language") private var appLanguageRaw = AppLanguage.ar.rawValue
    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }

    var body: some View {
        AppBackground {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 14) {

                    // Location card
                    VStack(alignment: lang.isRTL ? .trailing : .leading, spacing: 6) {
                        Label(lang.text(ar: "الموقع الحالي", en: "Current Location"),
                              systemImage: "location.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)
                        Text(locationManager.locationLabel)
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)
                        if let coordinates = locationManager.coordinatesLabel {
                            Text(coordinates)
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                                .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)
                        }
                    }
                    .appCard()

                    // Prayer rows
                    VStack(spacing: 1) {
                        ForEach(Array(prayerTimes.enumerated()), id: \.element.id) { index, prayer in
                            PrayerRow(prayer: prayer, lang: lang)
                            if index < prayerTimes.count - 1 {
                                if lang.isRTL {
                                    Divider().padding(.trailing, 16)
                                } else {
                                    Divider().padding(.leading, 16)
                                }
                            }
                        }
                    }
                    .background(AppTheme.surface,
                                in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .shadow(color: .black.opacity(0.04), radius: 8, x: 0, y: 2)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
        .navigationTitle(lang.text(ar: "الصلاة", en: "Prayer"))
        .navigationBarTitleDisplayMode(.large)
        .task { locationManager.requestLocation() }
        .onReceive(locationManager.$currentCoordinate) { coord in
            prayerTimes = PrayerTimeCalculator.todayTimes(for: coord)
        }
    }
}

private struct PrayerRow: View {
    let prayer: PrayerTime
    let lang: AppLanguage

    var body: some View {
        HStack(spacing: 12) {
            if lang.isRTL {
                Text(prayer.name)
                    .font(.body.weight(.semibold))
                    .frame(maxWidth: .infinity, alignment: .trailing)

                Text(prayer.displayTime(locale: lang.locale))
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.accent)
                    .monospacedDigit()
            } else {
                Text(prayer.displayTime(locale: lang.locale))
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.accent)
                    .monospacedDigit()

                Text(prayer.name)
                    .font(.body.weight(.semibold))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
    }
}

// MARK: - Quran

private struct QuranView: View {
    private let surahs = Surah.all
    @AppStorage("app_language") private var appLanguageRaw = AppLanguage.ar.rawValue
    @State private var selectedTab: QuranTab = .surahs
    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }
    private var isRTL: Bool { lang.isRTL }

    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    PageVerseCard(
                        verse: lang.text(
                            ar: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
                            en: "And recite the Qur'an with measured recitation."
                        ),
                        reference: "المزمل ٤",
                        lang: lang
                    )
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 12)

                    header

                    if selectedTab == .surahs {
                        LazyVStack(spacing: 0) {
                            ForEach(Array(surahs.enumerated()), id: \.element.id) { index, surah in
                                NavigationLink {
                                    SurahDetailView(surah: surah)
                                } label: {
                                    SurahRow(surah: surah)
                                }
                                .buttonStyle(.plain)

                                if index < surahs.count - 1 {
                                    Divider()
                                        .overlay(AppTheme.divider)
                                        .padding(.horizontal, 26)
                                }
                            }
                        }
                        .padding(.top, 14)
                        .padding(.bottom, 34)
                    } else {
                        Text(lang.text(
                            ar: "عرض الأرباع سيضاف في التحديث القادم",
                            en: "Quarters view will be added in the next update"))
                            .font(.system(size: 19, weight: .medium, design: .rounded))
                            .foregroundStyle(AppTheme.mutedText)
                            .padding(.top, 48)
                    }
                }
            }
        }
        .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var header: some View {
        VStack(spacing: 18) {
            HStack(spacing: 14) { tabSwitcher }
            .padding(.horizontal, 20)
            .padding(.top, 6)

            Divider()
                .overlay(AppTheme.divider)
        }
    }

    private var tabSwitcher: some View {
        HStack(spacing: 4) {
            tabButton(.surahs, ar: "السور", en: "Surahs")
            tabButton(.quarters, ar: "الأرباع", en: "Quarters")
        }
        .padding(4)
        .background(AppTheme.softSurface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .frame(maxWidth: 400)
    }

    private func tabButton(_ tab: QuranTab, ar: String, en: String) -> some View {
        let selected = selectedTab == tab
        return Button { selectedTab = tab } label: {
            Text(lang.text(ar: ar, en: en))
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundStyle(selected ? .primary : .secondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(selected ? AppTheme.surface : .clear)
                )
        }
        .buttonStyle(.plain)
    }

}

private struct SurahRow: View {
    let surah: Surah
    @AppStorage("app_language") private var appLanguageRaw = AppLanguage.ar.rawValue
    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }

    var body: some View {
        VStack(alignment: lang.isRTL ? .trailing : .leading, spacing: 10) {
            Text(surah.localizedPartLabel(for: lang))
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundStyle(AppTheme.mutedText)
                .multilineTextAlignment(lang.isRTL ? .trailing : .leading)
                .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)

            HStack(spacing: 14) {
                badge
                title
                Spacer(minLength: 0)
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 22)
        .contentShape(Rectangle())
        .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
    }

    private var badge: some View {
        ZStack {
            Circle().fill(AppTheme.softSurface)
            Text(surah.localizedNumber(for: lang))
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundStyle(.primary)
        }
        .frame(width: 50, height: 50)
    }

    private var title: some View {
        VStack(alignment: lang.isRTL ? .trailing : .leading, spacing: 3) {
            Text(surah.localizedName(for: lang))
                .font(.system(size: 15, weight: .bold, design: .default))
                .foregroundStyle(.primary)
                .multilineTextAlignment(lang.isRTL ? .trailing : .leading)
            Text(surah.localizedMetaLine(for: lang))
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundStyle(AppTheme.mutedText)
                .multilineTextAlignment(lang.isRTL ? .trailing : .leading)
        }
    }
}

private enum QuranTab {
    case surahs
    case quarters
}

private struct SurahDetailView: View {
    let surah: Surah
    @AppStorage("app_language") private var appLanguageRaw = AppLanguage.ar.rawValue
    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }

    var body: some View {
        let textAlignment: Alignment = lang.isRTL ? .trailing : .leading
        let multiline: TextAlignment = lang.isRTL ? .trailing : .leading
        AppBackground {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 14) {
                    VStack(alignment: lang.isRTL ? .trailing : .leading, spacing: 6) {
                        Text(surah.localizedDisplayTitle(for: lang))
                            .font(.largeTitle.weight(.bold))
                            .multilineTextAlignment(multiline)
                            .frame(maxWidth: .infinity, alignment: textAlignment)
                        Text("\(lang.text(ar: "رقم السورة", en: "Surah No.")): \(surah.number)")
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(multiline)
                            .frame(maxWidth: .infinity, alignment: textAlignment)
                        Text("\(lang.text(ar: "نوعها", en: "Type")): \(surah.localizedRevelation(for: lang))")
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(multiline)
                            .frame(maxWidth: .infinity, alignment: textAlignment)
                    }
                    .appCard()

                    VStack(alignment: lang.isRTL ? .trailing : .leading, spacing: 6) {
                        Label(lang.text(ar: "ابدأ القراءة", en: "Start Reading"), systemImage: "book.open.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: textAlignment)
                        Text(lang.text(
                            ar: "يمكن ربطها لاحقًا بنص السورة كاملًا.",
                            en: "Full surah text can be linked here later."))
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(multiline)
                            .frame(maxWidth: .infinity, alignment: textAlignment)
                    }
                    .appCard()
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
        .navigationTitle(surah.localizedDisplayTitle(for: lang))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
    }
}

// MARK: - Athkar

private struct AthkarView: View {
    @AppStorage("app_language") private var appLanguageRaw = AppLanguage.ar.rawValue
    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }
    @State private var selectedDhikr: Dhikr?

    private var athkar: [Dhikr] {
        [
            .init(
                id: "morning",
                title: lang.text(ar: "أذكار الصباح", en: "Morning Athkar"),
                count: 1,
                detail: lang.text(ar: "ابدأ يومك بالذكر والطمأنينة.", en: "Start your day with remembrance and calm."),
                icon: "sun.max.fill",
                colorA: Color(red: 0.78, green: 0.64, blue: 0.40),
                colorB: Color(red: 0.70, green: 0.57, blue: 0.36)
            ),
            .init(
                id: "evening",
                title: lang.text(ar: "أذكار المساء", en: "Evening Athkar"),
                count: 1,
                detail: lang.text(ar: "اختم يومك بالسكينة والدعاء.", en: "Close your day with peace and dua."),
                icon: "moon.stars.fill",
                colorA: Color(red: 0.49, green: 0.45, blue: 0.62),
                colorB: Color(red: 0.42, green: 0.39, blue: 0.56)
            ),
            .init(
                id: "post_prayer",
                title: lang.text(ar: "أذكار بعد الصلاة", en: "Post-Prayer Athkar"),
                count: 33,
                detail: lang.text(ar: "تسبيح وتحميد وتكبير.", en: "Tasbih, Tahmid, and Takbir."),
                icon: "hands.sparkles.fill",
                colorA: Color(red: 0.42, green: 0.64, blue: 0.56),
                colorB: Color(red: 0.36, green: 0.58, blue: 0.51)
            ),
            .init(
                id: "sleep",
                title: lang.text(ar: "أذكار النوم", en: "Sleep Athkar"),
                count: 1,
                detail: lang.text(ar: "أذكار قبل النوم.", en: "Remembrance before sleep."),
                icon: "bed.double.fill",
                colorA: Color(red: 0.38, green: 0.55, blue: 0.66),
                colorB: Color(red: 0.33, green: 0.49, blue: 0.60)
            ),
            .init(
                id: "travel",
                title: lang.text(ar: "أذكار السفر", en: "Travel Athkar"),
                count: 1,
                detail: lang.text(ar: "دعاء الطريق والحفظ.", en: "Travel duas and protection."),
                icon: "car.fill",
                colorA: Color(red: 0.47, green: 0.63, blue: 0.42),
                colorB: Color(red: 0.41, green: 0.56, blue: 0.37)
            ),
            .init(
                id: "home",
                title: lang.text(ar: "أذكار المنزل", en: "Home Athkar"),
                count: 1,
                detail: lang.text(ar: "أذكار دخول وخروج المنزل.", en: "Home entry and exit remembrance."),
                icon: "house.fill",
                colorA: Color(red: 0.36, green: 0.60, blue: 0.67),
                colorB: Color(red: 0.30, green: 0.54, blue: 0.61)
            ),
            .init(
                id: "food",
                title: lang.text(ar: "أذكار الأكل", en: "Food Athkar"),
                count: 1,
                detail: lang.text(ar: "دعاء قبل وبعد الطعام.", en: "Duas before and after eating."),
                icon: "fork.knife",
                colorA: Color(red: 0.64, green: 0.49, blue: 0.34),
                colorB: Color(red: 0.57, green: 0.43, blue: 0.29)
            ),
            .init(
                id: "istighfar",
                title: lang.text(ar: "الاستغفار", en: "Istighfar"),
                count: 100,
                detail: lang.text(ar: "استغفر الله وأتوب إليه.", en: "Seeking forgiveness from Allah."),
                icon: "heart.fill",
                colorA: Color(red: 0.70, green: 0.42, blue: 0.47),
                colorB: Color(red: 0.62, green: 0.37, blue: 0.42)
            )
        ]
    }

    var body: some View {
        AppBackground {
            ScrollView(showsIndicators: false) {
                let columns = [
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible(), spacing: 10)
                ]
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(athkar) { item in
                        Button {
                            selectedDhikr = item
                        } label: {
                            DhikrCard(item: item)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle(lang.text(ar: "الأذكار", en: "Athkar"))
        .navigationBarTitleDisplayMode(.large)
        .sheet(item: $selectedDhikr) { item in
            DhikrDetailSheet(item: item, language: lang)
                .presentationDetents([.large])
                .presentationDragIndicator(.hidden)
        }
    }
}

private struct DhikrCard: View {
    let item: Dhikr

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [item.colorA, item.colorB],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            Image(systemName: item.icon)
                .font(.system(size: 62, weight: .black))
                .foregroundStyle(.white.opacity(0.16))
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(16)

            Text(item.title)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(.white.opacity(0.94))
                .lineLimit(2)
                .minimumScaleFactor(0.7)
                .padding(.horizontal, 16)
                .padding(.bottom, 14)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .multilineTextAlignment(.trailing)
        }
        .frame(height: 128)
        .shadow(color: .black.opacity(0.04), radius: 8, x: 0, y: 3)
    }
}

private struct DhikrDetailSheet: View {
    let item: Dhikr
    let language: AppLanguage
    @State private var counters: [Int] = []

    private var athkarTexts: [String] {
        switch item.id {
        case "morning":
            return [
                "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ.",
                "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الكُفْرِ وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ.",
                "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ العَرْشِ العَظِيمِ."
            ]
        case "evening":
            return [
                "أَمْسَيْنَا وَأَمْسَى المُلكُ لِلَّهِ، والحَمدُ لِلَّهِ، لا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ.",
                "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ المَصِيرُ.",
                "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا."
            ]
        default:
            return [
                "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
                "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.",
                "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ."
            ]
        }
    }

    private var countLabel: String {
        language.text(ar: item.count <= 1 ? "مرة واحدة" : "\(item.count) مرات", en: item.count <= 1 ? "Once" : "\(item.count) times")
    }

    private var titleIcon: some View {
        RoundedRectangle(cornerRadius: 16, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [item.colorA, item.colorB],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(width: 74, height: 74)
            .overlay(
                Image(systemName: item.icon)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(.white.opacity(0.92))
            )
    }

    var body: some View {
        ZStack {
            Color(red: 0.93, green: 0.93, blue: 0.94).ignoresSafeArea()

            VStack(spacing: 16) {
                Capsule()
                    .fill(Color.gray.opacity(0.35))
                    .frame(width: 88, height: 8)
                    .padding(.top, 10)

                HStack(spacing: 10) {
                    titleIcon
                    Text(item.title)
                        .font(.system(size: 30, weight: .bold))
                        .minimumScaleFactor(0.75)
                        .lineLimit(1)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .multilineTextAlignment(.leading)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)

                ScrollView(showsIndicators: false) {
                    VStack(alignment: language.isRTL ? .trailing : .leading, spacing: 12) {
                        ForEach(Array(athkarTexts.enumerated()), id: \.offset) { index, text in
                            VStack(alignment: language.isRTL ? .trailing : .leading, spacing: 0) {
                                Text(language.isRTL ? "﴿ \(text) ﴾" : "“\(text)”")
                                    .font(.system(size: 24, weight: .medium))
                                    .foregroundStyle(Color(red: 0.10, green: 0.14, blue: 0.20))
                                    .lineSpacing(8)
                                    .multilineTextAlignment(language.isRTL ? .trailing : .leading)
                                    .frame(maxWidth: .infinity, alignment: language.isRTL ? .trailing : .leading)
                                    .padding(.horizontal, 18)
                                    .padding(.vertical, 18)

                                Divider()
                                    .overlay(Color.black.opacity(0.08))

                                HStack {
                                    Text("\(counters[safe: index] ?? 0)")
                                        .font(.system(size: 28, weight: .bold, design: .rounded))
                                        .foregroundStyle(AppTheme.accent)
                                        .monospacedDigit()
                                    Spacer()
                                    Text(countLabel)
                                        .font(.system(size: 22, weight: .semibold))
                                        .foregroundStyle(AppTheme.accent)
                                }
                                .padding(.horizontal, 18)
                                .padding(.vertical, 12)
                            }
                            .background(Color.white.opacity(0.7), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                            .contentShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                            .onTapGesture {
                                guard counters.indices.contains(index) else { return }
                                counters[index] += 1
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }

                Spacer(minLength: 0)
            }
        }
        .environment(\.layoutDirection, language.isRTL ? .rightToLeft : .leftToRight)
        .onAppear {
            if counters.count != athkarTexts.count {
                counters = Array(repeating: 0, count: athkarTexts.count)
            }
        }
    }
}

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

// MARK: - Sebha

private struct SebhaView: View {
    @AppStorage("sebha_items_json") private var itemsJSON = ""
    @AppStorage("sebha_selected_item_id") private var selectedItemID = "subhanallah_wabihamdih"
    @AppStorage("sebha_goal") private var goal = 50
    @AppStorage("sebha_sound_enabled") private var soundEnabled = true
    @AppStorage("app_language") private var appLanguageRaw = AppLanguage.ar.rawValue
    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }
    @State private var items: [SebhaItem] = []
    @State private var showPickerSheet = false
    @State private var showGoalSheet = false
    @State private var showCelebration = false

    var body: some View {
        AppBackground {
            ZStack {
                Color.clear

                VStack(spacing: 0) {
                    topBar
                        .padding(.horizontal, 16)
                        .padding(.top, 8)

                    Spacer(minLength: 0)

                    Text("\(selectedCount)")
                        .font(.system(size: 104, weight: .black, design: .rounded))
                        .foregroundStyle(Color.primary.opacity(0.92))
                        .monospacedDigit()

                    if goal > 0 {
                        Text("\(selectedCount) / \(goal)")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundStyle(AppTheme.accent)
                            .monospacedDigit()
                            .padding(.top, 6)
                    }

                    Spacer(minLength: 0)

                    Button {
                        showPickerSheet = true
                    } label: {
                        Text(selectedItem?.text ?? lang.text(ar: "اختر الذكر", en: "Choose Dhikr"))
                            .font(.system(size: 38, weight: .semibold))
                            .foregroundStyle(AppTheme.accent)
                            .lineLimit(2)
                            .minimumScaleFactor(0.6)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 28)
                            .padding(.vertical, 16)
                            .background(AppTheme.surface.opacity(0.96), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 24, style: .continuous)
                                    .stroke(AppTheme.divider.opacity(0.35), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal, 24)
                    .padding(.bottom, 38)
                }

                if showCelebration {
                    SebhaCelebrationOverlay()
                        .transition(.opacity.combined(with: .scale))
                }
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
            incrementSelected()
        }
        .task {
            loadItemsIfNeeded()
        }
        .sheet(isPresented: $showPickerSheet) {
            SebhaPickerSheet(
                lang: lang,
                items: $items,
                selectedItemID: $selectedItemID
            )
            .onDisappear {
                saveItems()
            }
        }
        .sheet(isPresented: $showGoalSheet) {
            SebhaGoalSheet(lang: lang, goal: $goal)
        }
        .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
        .navigationTitle(lang.text(ar: "السبحة", en: "Sebha"))
        .navigationBarTitleDisplayMode(.large)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var topBar: some View {
        VStack(spacing: 18) {
            HStack {
                if lang.isRTL {
                    goalButton
                    Spacer()
                    soundButton
                    resetButton
                } else {
                    resetButton
                    soundButton
                    Spacer()
                    goalButton
                }
            }

            HStack {
                if !lang.isRTL { Spacer() }
                Text(lang.text(ar: "السبحة", en: "Sebha"))
                    .font(.system(size: 58, weight: .black))
                    .foregroundStyle(.primary)
                if lang.isRTL { Spacer() }
            }
        }
    }

    private var resetButton: some View {
        Button {
            resetSelected()
        } label: {
            Image(systemName: "arrow.counterclockwise")
                .font(.system(size: 32, weight: .regular))
                .foregroundStyle(Color.blue.opacity(0.95))
        }
        .buttonStyle(.plain)
    }

    private var soundButton: some View {
        Button {
            soundEnabled.toggle()
        } label: {
            Image(systemName: soundEnabled ? "speaker.wave.2.fill" : "speaker.slash.fill")
                .font(.system(size: 28, weight: .regular))
                .foregroundStyle(Color.blue.opacity(0.95))
        }
        .buttonStyle(.plain)
    }

    private var goalButton: some View {
        Button {
            showGoalSheet = true
        } label: {
            Text(goalButtonTitle)
                .font(.system(size: 16, weight: .bold))
                .foregroundStyle(AppTheme.accent)
                .padding(.horizontal, 18)
                .padding(.vertical, 9)
                .background(AppTheme.surface.opacity(0.96), in: Capsule())
        }
        .buttonStyle(.plain)
    }

    private var goalButtonTitle: String {
        if goal > 0 {
            return lang.text(ar: "الهدف: \(goal)", en: "Goal: \(goal)")
        }
        return lang.text(ar: "تحديد هدف", en: "Set Goal")
    }

    private var selectedItem: SebhaItem? {
        items.first(where: { $0.id == selectedItemID })
    }

    private var selectedCount: Int {
        selectedItem?.count ?? 0
    }

    private func loadItemsIfNeeded() {
        guard items.isEmpty else { return }
        if let data = itemsJSON.data(using: .utf8),
           let decoded = try? JSONDecoder().decode([SebhaItem].self, from: data),
           !decoded.isEmpty {
            items = decoded
        } else {
            items = SebhaItem.defaultItems
            saveItems()
        }

        if !items.contains(where: { $0.id == selectedItemID }), let first = items.first {
            selectedItemID = first.id
        }
    }

    private func saveItems() {
        guard let data = try? JSONEncoder().encode(items),
              let json = String(data: data, encoding: .utf8) else { return }
        itemsJSON = json
    }

    private func incrementSelected() {
        guard let idx = items.firstIndex(where: { $0.id == selectedItemID }) else { return }
        let previous = items[idx].count
        items[idx].count += 1
        saveItems()

        if soundEnabled {
            AudioServicesPlaySystemSound(1104)
        }

        if goal > 0, previous < goal, items[idx].count >= goal {
            triggerCelebration()
        }
    }

    private func resetSelected() {
        guard let idx = items.firstIndex(where: { $0.id == selectedItemID }) else { return }
        items[idx].count = 0
        saveItems()
    }

    private func triggerCelebration() {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.72)) {
            showCelebration = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            withAnimation(.easeOut(duration: 0.35)) {
                showCelebration = false
            }
        }
    }
}

private struct SebhaCelebrationOverlay: View {
    private let symbols = ["✨", "🎉", "🌟", "💫", "🟢", "🔹"]

    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(0..<16, id: \.self) { i in
                    Text(symbols[i % symbols.count])
                        .font(.system(size: CGFloat(18 + (i % 3) * 6)))
                        .position(
                            x: CGFloat.random(in: 24...(geo.size.width - 24)),
                            y: CGFloat.random(in: 80...(geo.size.height - 80))
                        )
                        .opacity(0.9)
                }
            }
        }
        .allowsHitTesting(false)
    }
}

private struct SebhaPickerSheet: View {
    let lang: AppLanguage
    @Binding var items: [SebhaItem]
    @Binding var selectedItemID: String
    @Environment(\.dismiss) private var dismiss
    @State private var showAdd = false
    @State private var newDhikrText = ""

    var body: some View {
        ZStack {
            Color(red: 0.05, green: 0.06, blue: 0.10).ignoresSafeArea()

            VStack(spacing: 0) {
                Capsule()
                    .fill(Color.gray.opacity(0.5))
                    .frame(width: 84, height: 8)
                    .padding(.top, 12)

                HStack {
                    Button(lang.text(ar: "تعديل", en: "Edit")) {
                        showAdd = true
                    }
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(Color.blue.opacity(0.95))

                    Spacer()

                    Text(lang.text(ar: "اختيار الذكر", en: "Select Dhikr"))
                        .font(.system(size: 44, weight: .bold))
                        .foregroundStyle(.white.opacity(0.95))
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)

                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                            Button {
                                selectedItemID = item.id
                                dismiss()
                            } label: {
                                HStack(spacing: 10) {
                                    if lang.isRTL {
                                        Text(item.text)
                                            .font(.system(size: 20, weight: .semibold))
                                            .foregroundStyle(item.id == selectedItemID ? Color.blue.opacity(0.95) : Color.white.opacity(0.75))
                                            .multilineTextAlignment(.trailing)
                                            .frame(maxWidth: .infinity, alignment: .trailing)
                                        Text("\(item.count)")
                                            .font(.system(size: 24, weight: .bold, design: .rounded))
                                            .foregroundStyle(Color.white.opacity(0.5))
                                            .monospacedDigit()
                                            .frame(width: 64, alignment: .trailing)
                                    } else {
                                        Text("\(item.count)")
                                            .font(.system(size: 24, weight: .bold, design: .rounded))
                                            .foregroundStyle(Color.white.opacity(0.5))
                                            .monospacedDigit()
                                            .frame(width: 64, alignment: .leading)
                                        Text(item.text)
                                            .font(.system(size: 20, weight: .semibold))
                                            .foregroundStyle(item.id == selectedItemID ? Color.blue.opacity(0.95) : Color.white.opacity(0.75))
                                            .multilineTextAlignment(.leading)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 18)
                            }
                            .buttonStyle(.plain)

                            if index < items.count - 1 {
                                Divider().overlay(Color.white.opacity(0.08)).padding(.horizontal, 16)
                            }
                        }
                    }
                    .background(Color.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .padding(.horizontal, 12)
                    .padding(.top, 8)
                }

                HStack {
                    Button(lang.text(ar: "إعادة تعيين الكل", en: "Reset All")) {
                        for index in items.indices {
                            items[index].count = 0
                        }
                    }
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(Color.blue.opacity(0.95))

                    Spacer()

                    Button {
                        showAdd = true
                    } label: {
                        HStack(spacing: 8) {
                            Text(lang.text(ar: "ذكر جديد", en: "New Dhikr"))
                                .font(.system(size: 18, weight: .medium))
                            Image(systemName: "plus.circle.fill")
                                .font(.title2)
                        }
                        .foregroundStyle(Color.blue.opacity(0.95))
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
            }
        }
        .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
        .alert(lang.text(ar: "ذكر جديد", en: "New Dhikr"), isPresented: $showAdd) {
            TextField(lang.text(ar: "اكتب الذكر", en: "Enter dhikr"), text: $newDhikrText)
            Button(lang.text(ar: "إضافة", en: "Add")) {
                let trimmed = newDhikrText.trimmingCharacters(in: .whitespacesAndNewlines)
                if !trimmed.isEmpty {
                    let item = SebhaItem(id: UUID().uuidString, text: trimmed, count: 0)
                    items.append(item)
                    selectedItemID = item.id
                    newDhikrText = ""
                }
            }
            Button(lang.text(ar: "إلغاء", en: "Cancel"), role: .cancel) {}
        }
    }
}

private struct SebhaGoalSheet: View {
    let lang: AppLanguage
    @Binding var goal: Int
    @Environment(\.dismiss) private var dismiss
    @State private var tempGoal = 33

    var body: some View {
        NavigationStack {
            Form {
                Stepper(value: $tempGoal, in: 1...10000, step: 1) {
                    HStack {
                        Text("\(tempGoal)")
                            .font(.title3.weight(.bold))
                            .monospacedDigit()
                        Spacer()
                        Text(lang.text(ar: "الهدف", en: "Goal"))
                    }
                }
            }
            .navigationTitle(lang.text(ar: "تحديد الهدف", en: "Set Goal"))
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button(lang.text(ar: "إلغاء", en: "Cancel")) { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button(lang.text(ar: "حفظ", en: "Save")) {
                        goal = tempGoal
                        dismiss()
                    }
                    .fontWeight(.bold)
                }
            }
        }
        .environment(\.layoutDirection, lang.isRTL ? .rightToLeft : .leftToRight)
        .onAppear {
            tempGoal = max(1, goal)
        }
    }
}

// MARK: - Settings

private struct SettingsView: View {
    @Binding var appLanguageRaw: String
    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }

    var body: some View {
        AppBackground {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {

                    // Language card
                    VStack(spacing: 14) {
                        Label(lang.text(ar: "اللغة", en: "Language"), systemImage: "globe")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)

                        // Fix RTL picker inversion: force LTR so segment order stays consistent
                        Picker(lang.text(ar: "اللغة", en: "Language"), selection: $appLanguageRaw) {
                            Text("العربية").tag(AppLanguage.ar.rawValue)
                            Text("English").tag(AppLanguage.en.rawValue)
                        }
                        .pickerStyle(.segmented)
                        .environment(\.layoutDirection, .leftToRight)

                        Text(lang.text(
                            ar: "تتغير واجهة التطبيق تلقائيًا حسب اللغة المختارة",
                            en: "The app interface changes automatically based on the selected language"))
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)
                    }
                    .appCard()

                    // About card
                    VStack(spacing: 10) {
                        Label(lang.text(ar: "عن التطبيق", en: "About"), systemImage: "info.circle.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)

                        HStack {
                            if lang.isRTL { Spacer() }
                            VStack(alignment: lang.isRTL ? .trailing : .leading, spacing: 4) {
                                Text(lang.text(ar: "أذكار — تطبيق الذكر والعبادة", en: "Athkar — Worship & Remembrance App"))
                                    .font(.subheadline.weight(.medium))
                                Text(lang.text(ar: "النسخة ١.٠", en: "Version 1.0"))
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            if !lang.isRTL { Spacer() }
                        }
                    }
                    .appCard()

                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle(lang.text(ar: "الإعدادات", en: "Settings"))
        .navigationBarTitleDisplayMode(.large)
    }
}

// MARK: - Shared Components

private struct ChecklistRow: View {
    let title: String
    let icon: String
    @Binding var isDone: Bool

    var body: some View {
        Button { withAnimation(.spring(duration: 0.25)) { isDone.toggle() } } label: {
            HStack(spacing: 14) {
                Image(systemName: isDone ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(isDone ? AppTheme.accent : Color(UIColor.tertiaryLabel))
                    .animation(.spring(duration: 0.25), value: isDone)

                Text(title)
                    .font(.body.weight(.medium))
                    .foregroundStyle(isDone ? .secondary : .primary)
                    .strikethrough(isDone, color: .secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Image(systemName: icon)
                    .font(.body)
                    .foregroundStyle(isDone ? AppTheme.accent.opacity(0.5) : AppTheme.accent)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(isDone
                          ? AppTheme.surface.opacity(0.7)
                          : AppTheme.surface)
                    .shadow(color: .black.opacity(isDone ? 0.02 : 0.05), radius: 8, x: 0, y: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

private struct SectionHeader: View {
    let title: String
    @AppStorage("app_language") private var appLanguageRaw = AppLanguage.ar.rawValue
    private var lang: AppLanguage { AppLanguage(rawValue: appLanguageRaw) ?? .ar }
    var body: some View {
        Text(title)
            .font(.footnote.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
            .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)
            .padding(.horizontal, 6)
            .padding(.top, 6)
    }
}

private struct TodayHeroCard: View {
    let lang: AppLanguage
    let doneCount: Int
    let progress: Double

    var body: some View {
        VStack(alignment: lang.isRTL ? .trailing : .leading, spacing: 14) {
            Text(lang.text(ar: "رحلة يومك مع الذكر", en: "Your Day of Remembrance"))
                .font(.system(size: 29, weight: .black))
                .foregroundStyle(.white.opacity(0.96))
                .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)

            HStack {
                if lang.isRTL {
                    Text(lang.text(ar: "مكتمل \(doneCount) من ١٠", en: "\(doneCount) of 10 completed"))
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                    Spacer()
                    progressRing
                } else {
                    progressRing
                    Spacer()
                    Text(lang.text(ar: "مكتمل \(doneCount) من ١٠", en: "\(doneCount) of 10 completed"))
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                }
            }
        }
        .padding(20)
        .background(
            LinearGradient(
                colors: [Color(red: 0.12, green: 0.57, blue: 0.37), Color(red: 0.06, green: 0.42, blue: 0.29)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 24, style: .continuous)
        )
    }

    private var progressRing: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.28), lineWidth: 8)
            Circle()
                .trim(from: 0, to: max(0.02, min(progress, 1)))
                .stroke(Color.white, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Text("\(Int(progress * 100))%")
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
        }
        .frame(width: 62, height: 62)
    }
}

private struct PageVerseCard: View {
    let verse: String
    let reference: String
    let lang: AppLanguage

    var body: some View {
        VStack(alignment: lang.isRTL ? .trailing : .leading, spacing: 8) {
            Text("﴿ \(verse) ﴾")
                .font(.system(size: 15, weight: .semibold))
                .multilineTextAlignment(lang.isRTL ? .trailing : .leading)
                .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)
            Text(reference)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: lang.isRTL ? .trailing : .leading)
        }
        .padding(.horizontal, 2)
        .padding(.bottom, 4)
    }
}

// MARK: - Background & Card Style

private enum AppTheme {
    static let accent = Color(red: 0.07, green: 0.51, blue: 0.31)
    static let accentGradient = LinearGradient(
        colors: [Color(red: 0.09, green: 0.61, blue: 0.38), Color(red: 0.05, green: 0.47, blue: 0.28)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    static let background = LinearGradient(
        colors: [Color(red: 0.97, green: 0.96, blue: 0.94), Color(red: 0.94, green: 0.92, blue: 0.89)],
        startPoint: .top,
        endPoint: .bottom
    )
    static let tabBarBackground = Color(red: 0.96, green: 0.95, blue: 0.93)
    static let surface = Color(red: 0.99, green: 0.98, blue: 0.97)
    static let softSurface = Color(red: 0.92, green: 0.89, blue: 0.84)
    static let divider = Color(red: 0.83, green: 0.79, blue: 0.73)
    static let mutedText = Color(red: 0.63, green: 0.52, blue: 0.40)
}

private struct AppBackground<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()
            content
        }
    }
}

private extension View {
    func appCard(cornerRadius: CGFloat = 18, verticalPadding: CGFloat = 16) -> some View {
        self
            .padding(.horizontal, 16)
            .padding(.vertical, verticalPadding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(AppTheme.surface)
                    .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
            )
    }
}

// MARK: - Language

private enum AppLanguage: String, CaseIterable {
    case ar
    case en

    var isRTL: Bool { self == .ar }
    var locale: Locale { Locale(identifier: self == .ar ? "ar" : "en") }

    func text(ar: String, en: String) -> String {
        self == .ar ? ar : en
    }
}

// MARK: - Prayer Model

private struct PrayerTime: Identifiable {
    let id = UUID()
    let name: String
    let date: Date

    func displayTime(locale: Locale) -> String {
        date.formatted(.dateTime.locale(locale).hour().minute())
    }
}

private enum PrayerTimeCalculator {
    static func todayTimes(for coordinate: CLLocationCoordinate2D?) -> [PrayerTime] {
        let calendar = Calendar.current
        let now = Date()
        let shift = longitudeShiftMinutes(for: coordinate)

        func build(_ hour: Int, _ minute: Int) -> Date {
            let base = calendar.date(bySettingHour: hour, minute: minute, second: 0, of: now) ?? now
            return calendar.date(byAdding: .minute, value: shift, to: base) ?? base
        }

        return [
            PrayerTime(name: "الفجر",    date: build(5,  10)),
            PrayerTime(name: "الشروق",   date: build(6,  35)),
            PrayerTime(name: "الظهر",    date: build(12, 15)),
            PrayerTime(name: "العصر",    date: build(15, 35)),
            PrayerTime(name: "المغرب",   date: build(18, 5)),
            PrayerTime(name: "العشاء",   date: build(19, 35))
        ]
    }

    private static func longitudeShiftMinutes(for coordinate: CLLocationCoordinate2D?) -> Int {
        guard let coordinate else { return 0 }
        let timezoneLongitude = TimeZone.current.secondsFromGMT() / 3600 * 15
        let rawShift = (timezoneLongitude - Int(coordinate.longitude.rounded())) * 4
        return max(-45, min(45, rawShift))
    }
}

// MARK: - Location

private final class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var locationLabel = "جاري تحديد الموقع..."
    @Published var coordinatesLabel: String?
    @Published var currentCoordinate: CLLocationCoordinate2D?

    private let manager = CLLocationManager()

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    func requestLocation() {
        switch manager.authorizationStatus {
        case .notDetermined:             manager.requestWhenInUseAuthorization()
        case .authorizedWhenInUse,
             .authorizedAlways:          manager.requestLocation()
        case .restricted, .denied:       locationLabel = "تم رفض إذن الموقع"
        @unknown default:                locationLabel = "حالة الموقع غير معروفة"
        }
    }

    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if status == .authorizedAlways || status == .authorizedWhenInUse {
            manager.requestLocation()
        } else if status == .denied || status == .restricted {
            locationLabel = "تم رفض إذن الموقع"
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        currentCoordinate = location.coordinate
        coordinatesLabel = String(format: "%.4f, %.4f",
                                  location.coordinate.latitude,
                                  location.coordinate.longitude)
        if #unavailable(iOS 26.0) {
            CLGeocoder().reverseGeocodeLocation(location) { [weak self] placemarks, _ in
                guard let self else { return }
                if let placemark = placemarks?.first {
                    let city = placemark.locality ?? placemark.subAdministrativeArea ?? ""
                    let country = placemark.country ?? ""
                    let combined = [city, country].filter { !$0.isEmpty }.joined(separator: "، ")
                    self.locationLabel = combined.isEmpty ? "الموقع متاح" : combined
                } else {
                    self.locationLabel = "الموقع متاح"
                }
            }
            return
        }

        locationLabel = "الموقع متاح"
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        locationLabel = "تعذر تحديد الموقع"
    }
}

// MARK: - Data Models

private struct Surah: Identifiable {
    let id = UUID()
    let number: Int
    let name: String
    let revelation: String

    func localizedName(for lang: AppLanguage) -> String {
        if lang == .ar { return name }
        guard (1...Self.englishNames.count).contains(number) else { return name }
        return Self.englishNames[number - 1]
    }

    func localizedNumber(for lang: AppLanguage) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: lang.rawValue)
        return formatter.string(from: NSNumber(value: number)) ?? "\(number)"
    }

    func localizedDisplayTitle(for lang: AppLanguage) -> String {
        return "\(localizedNumber(for: lang)). \(localizedName(for: lang))"
    }

    func localizedRevelation(for lang: AppLanguage) -> String {
        guard lang == .en else { return revelation }
        return revelation == "مدنية" ? "Medinan" : "Meccan"
    }

    func localizedPartLabel(for lang: AppLanguage) -> String {
        let part = Self.partBySurah[number] ?? estimatedPartFromPage()
        if lang == .ar {
            return "الجزء \(localizedValue(part, for: lang))"
        }
        return "PART \(part)"
    }

    func localizedMetaLine(for lang: AppLanguage) -> String {
        let page = Self.pageStartBySurah[number] ?? estimatedPageStart()
        let verses = Self.versesBySurah[number] ?? estimatedVerses()
        if lang == .ar {
            return "الصفحة \(localizedValue(page, for: lang)) - \(localizedValue(verses, for: lang)) آية - \(localizedRevelation(for: lang))"
        }
        return "Page \(page) - \(verses) verses - \(localizedRevelation(for: lang))"
    }

    private func estimatedPartFromPage() -> Int {
        min(30, max(1, Int(ceil(Double(estimatedPageStart()) / 20.0))))
    }

    private func estimatedPageStart() -> Int {
        min(604, 208 + max(0, number - 10) * 4)
    }

    private func estimatedVerses() -> Int {
        max(6, 180 - number + ((number % 7) * 4))
    }

    private func localizedValue(_ value: Int, for lang: AppLanguage) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: lang.rawValue)
        return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
    }

    private static let englishNames: [String] = [
        "Al-Fatiha", "Al-Baqarah", "Aal-E-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf",
        "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl",
        "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur",
        "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah",
        "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat",
        "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath",
        "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah",
        "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun",
        "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh",
        "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba",
        "An-Nazi'at", "Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
        "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha",
        "Ash-Sharh", "At-Tin", "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat",
        "Al-Qari'ah", "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar",
        "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
    ]

    private static let pageStartBySurah: [Int: Int] = [
        1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208
    ]

    private static let versesBySurah: [Int: Int] = [
        1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109
    ]

    private static let partBySurah: [Int: Int] = [
        1: 1, 2: 1, 3: 3, 4: 4, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11
    ]

    static let all: [Surah] = [
        .init(number: 1,   name: "الفاتحة",    revelation: "مكية"),
        .init(number: 2,   name: "البقرة",     revelation: "مدنية"),
        .init(number: 3,   name: "آل عمران",   revelation: "مدنية"),
        .init(number: 4,   name: "النساء",     revelation: "مدنية"),
        .init(number: 5,   name: "المائدة",    revelation: "مدنية"),
        .init(number: 6,   name: "الأنعام",    revelation: "مكية"),
        .init(number: 7,   name: "الأعراف",    revelation: "مكية"),
        .init(number: 8,   name: "الأنفال",    revelation: "مدنية"),
        .init(number: 9,   name: "التوبة",     revelation: "مدنية"),
        .init(number: 10,  name: "يونس",       revelation: "مكية"),
        .init(number: 11,  name: "هود",        revelation: "مكية"),
        .init(number: 12,  name: "يوسف",       revelation: "مكية"),
        .init(number: 13,  name: "الرعد",      revelation: "مدنية"),
        .init(number: 14,  name: "إبراهيم",    revelation: "مكية"),
        .init(number: 15,  name: "الحجر",      revelation: "مكية"),
        .init(number: 16,  name: "النحل",      revelation: "مكية"),
        .init(number: 17,  name: "الإسراء",    revelation: "مكية"),
        .init(number: 18,  name: "الكهف",      revelation: "مكية"),
        .init(number: 19,  name: "مريم",       revelation: "مكية"),
        .init(number: 20,  name: "طه",         revelation: "مكية"),
        .init(number: 21,  name: "الأنبياء",   revelation: "مكية"),
        .init(number: 22,  name: "الحج",       revelation: "مدنية"),
        .init(number: 23,  name: "المؤمنون",   revelation: "مكية"),
        .init(number: 24,  name: "النور",      revelation: "مدنية"),
        .init(number: 25,  name: "الفرقان",    revelation: "مكية"),
        .init(number: 26,  name: "الشعراء",    revelation: "مكية"),
        .init(number: 27,  name: "النمل",      revelation: "مكية"),
        .init(number: 28,  name: "القصص",      revelation: "مكية"),
        .init(number: 29,  name: "العنكبوت",   revelation: "مكية"),
        .init(number: 30,  name: "الروم",      revelation: "مكية"),
        .init(number: 31,  name: "لقمان",      revelation: "مكية"),
        .init(number: 32,  name: "السجدة",     revelation: "مكية"),
        .init(number: 33,  name: "الأحزاب",    revelation: "مدنية"),
        .init(number: 34,  name: "سبأ",        revelation: "مكية"),
        .init(number: 35,  name: "فاطر",       revelation: "مكية"),
        .init(number: 36,  name: "يس",         revelation: "مكية"),
        .init(number: 37,  name: "الصافات",    revelation: "مكية"),
        .init(number: 38,  name: "ص",          revelation: "مكية"),
        .init(number: 39,  name: "الزمر",      revelation: "مكية"),
        .init(number: 40,  name: "غافر",       revelation: "مكية"),
        .init(number: 41,  name: "فصلت",       revelation: "مكية"),
        .init(number: 42,  name: "الشورى",     revelation: "مكية"),
        .init(number: 43,  name: "الزخرف",     revelation: "مكية"),
        .init(number: 44,  name: "الدخان",     revelation: "مكية"),
        .init(number: 45,  name: "الجاثية",    revelation: "مكية"),
        .init(number: 46,  name: "الأحقاف",    revelation: "مكية"),
        .init(number: 47,  name: "محمد",       revelation: "مدنية"),
        .init(number: 48,  name: "الفتح",      revelation: "مدنية"),
        .init(number: 49,  name: "الحجرات",    revelation: "مدنية"),
        .init(number: 50,  name: "ق",          revelation: "مكية"),
        .init(number: 51,  name: "الذاريات",   revelation: "مكية"),
        .init(number: 52,  name: "الطور",      revelation: "مكية"),
        .init(number: 53,  name: "النجم",      revelation: "مكية"),
        .init(number: 54,  name: "القمر",      revelation: "مكية"),
        .init(number: 55,  name: "الرحمن",     revelation: "مدنية"),
        .init(number: 56,  name: "الواقعة",    revelation: "مكية"),
        .init(number: 57,  name: "الحديد",     revelation: "مدنية"),
        .init(number: 58,  name: "المجادلة",   revelation: "مدنية"),
        .init(number: 59,  name: "الحشر",      revelation: "مدنية"),
        .init(number: 60,  name: "الممتحنة",   revelation: "مدنية"),
        .init(number: 61,  name: "الصف",       revelation: "مدنية"),
        .init(number: 62,  name: "الجمعة",     revelation: "مدنية"),
        .init(number: 63,  name: "المنافقون",  revelation: "مدنية"),
        .init(number: 64,  name: "التغابن",    revelation: "مدنية"),
        .init(number: 65,  name: "الطلاق",     revelation: "مدنية"),
        .init(number: 66,  name: "التحريم",    revelation: "مدنية"),
        .init(number: 67,  name: "الملك",      revelation: "مكية"),
        .init(number: 68,  name: "القلم",      revelation: "مكية"),
        .init(number: 69,  name: "الحاقة",     revelation: "مكية"),
        .init(number: 70,  name: "المعارج",    revelation: "مكية"),
        .init(number: 71,  name: "نوح",        revelation: "مكية"),
        .init(number: 72,  name: "الجن",       revelation: "مكية"),
        .init(number: 73,  name: "المزمل",     revelation: "مكية"),
        .init(number: 74,  name: "المدثر",     revelation: "مكية"),
        .init(number: 75,  name: "القيامة",    revelation: "مكية"),
        .init(number: 76,  name: "الإنسان",    revelation: "مدنية"),
        .init(number: 77,  name: "المرسلات",   revelation: "مكية"),
        .init(number: 78,  name: "النبأ",      revelation: "مكية"),
        .init(number: 79,  name: "النازعات",   revelation: "مكية"),
        .init(number: 80,  name: "عبس",        revelation: "مكية"),
        .init(number: 81,  name: "التكوير",    revelation: "مكية"),
        .init(number: 82,  name: "الانفطار",   revelation: "مكية"),
        .init(number: 83,  name: "المطففين",   revelation: "مكية"),
        .init(number: 84,  name: "الانشقاق",   revelation: "مكية"),
        .init(number: 85,  name: "البروج",     revelation: "مكية"),
        .init(number: 86,  name: "الطارق",     revelation: "مكية"),
        .init(number: 87,  name: "الأعلى",     revelation: "مكية"),
        .init(number: 88,  name: "الغاشية",    revelation: "مكية"),
        .init(number: 89,  name: "الفجر",      revelation: "مكية"),
        .init(number: 90,  name: "البلد",      revelation: "مكية"),
        .init(number: 91,  name: "الشمس",      revelation: "مكية"),
        .init(number: 92,  name: "الليل",      revelation: "مكية"),
        .init(number: 93,  name: "الضحى",      revelation: "مكية"),
        .init(number: 94,  name: "الشرح",      revelation: "مكية"),
        .init(number: 95,  name: "التين",      revelation: "مكية"),
        .init(number: 96,  name: "العلق",      revelation: "مكية"),
        .init(number: 97,  name: "القدر",      revelation: "مكية"),
        .init(number: 98,  name: "البينة",     revelation: "مدنية"),
        .init(number: 99,  name: "الزلزلة",    revelation: "مدنية"),
        .init(number: 100, name: "العاديات",   revelation: "مكية"),
        .init(number: 101, name: "القارعة",    revelation: "مكية"),
        .init(number: 102, name: "التكاثر",    revelation: "مكية"),
        .init(number: 103, name: "العصر",      revelation: "مكية"),
        .init(number: 104, name: "الهمزة",     revelation: "مكية"),
        .init(number: 105, name: "الفيل",      revelation: "مكية"),
        .init(number: 106, name: "قريش",       revelation: "مكية"),
        .init(number: 107, name: "الماعون",    revelation: "مكية"),
        .init(number: 108, name: "الكوثر",     revelation: "مكية"),
        .init(number: 109, name: "الكافرون",   revelation: "مكية"),
        .init(number: 110, name: "النصر",      revelation: "مدنية"),
        .init(number: 111, name: "المسد",      revelation: "مكية"),
        .init(number: 112, name: "الإخلاص",   revelation: "مكية"),
        .init(number: 113, name: "الفلق",      revelation: "مكية"),
        .init(number: 114, name: "الناس",      revelation: "مكية")
    ]
}

private struct Dhikr: Identifiable {
    let id: String
    let title: String
    let count: Int
    let detail: String
    let icon: String
    let colorA: Color
    let colorB: Color
}

private struct SebhaItem: Identifiable, Codable, Hashable {
    let id: String
    var text: String
    var count: Int

    static let defaultItems: [SebhaItem] = [
        .init(id: "subhanallah_wabihamdih", text: "سبحان الله وبحمده", count: 0),
        .init(id: "astaghfirullah", text: "أستغفر الله وأتوب إليه", count: 0),
        .init(id: "allahumma_salli", text: "اللهم صل وسلم على نبينا محمد", count: 0),
        .init(id: "la_ilaha_illah", text: "لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير", count: 0)
    ]
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

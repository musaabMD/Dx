import SwiftUI

struct TasksView: View {
    @EnvironmentObject private var store: NahrStore

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    SectionHeader(
                        title: store.text(ar: "المهام", en: "Tasks"),
                        subtitle: store.text(ar: "اليوم، المجدول، والمتأخر", en: "Today, scheduled, and overdue at a glance")
                    )
                    .padding(.top, 22)

                    HStack(spacing: 10) {
                        taskFilterButton(.today, ar: "اليوم", en: "Today")
                        taskFilterButton(.scheduled, ar: "مجدولة", en: "Scheduled")
                        taskFilterButton(.all, ar: "الكل", en: "All")
                    }
                    .padding(6)
                    .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 24)

                    ForEach(store.tasksForCurrentFilter()) { task in
                        TaskRow(task: task)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 120)
            }
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private func taskFilterButton(_ filter: TaskFilter, ar: String, en: String) -> some View {
        Button {
            withAnimation(.spring(response: 0.32, dampingFraction: 0.84)) {
                store.taskFilter = filter
            }
        } label: {
            Text(store.text(ar: ar, en: en))
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .foregroundStyle(.white)
                .background {
                    if store.taskFilter == filter {
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(store.settings.accent.primary.opacity(0.36))
                    }
                }
        }
        .buttonStyle(.plain)
    }
}

private struct TaskRow: View {
    @EnvironmentObject private var store: NahrStore
    let task: NahrTask

    var body: some View {
        Button {
            store.toggleTask(task)
        } label: {
            HStack(spacing: 14) {
                Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(task.completed ? Color.green : .white.opacity(0.72))

                VStack(alignment: .leading, spacing: 6) {
                    Text(task.title)
                        .font(.system(size: 16, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white.opacity(task.completed ? 0.56 : 1.0))
                        .strikethrough(task.completed, color: .white.opacity(0.50))
                    HStack(spacing: 8) {
                        Text(priorityText(task.priority))
                        if let dueDate = task.dueDate {
                            Text(DateFormatting.dualDate(for: dueDate, language: store.settings.language, preference: .gregorian))
                        } else {
                            Text(store.text(ar: "بدون موعد", en: "No due date"))
                        }
                    }
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.66))
                }

                Spacer()
            }
            .padding(16)
            .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(task.completed ? 0.08 : 0.18), cornerRadius: 24)
        }
        .buttonStyle(.plain)
    }

    private func priorityText(_ priority: TaskPriority) -> String {
        switch priority {
        case .low: store.text(ar: "أولوية منخفضة", en: "Low priority")
        case .medium: store.text(ar: "أولوية متوسطة", en: "Medium priority")
        case .high: store.text(ar: "أولوية عالية", en: "High priority")
        }
    }
}

struct SearchView: View {
    @EnvironmentObject private var store: NahrStore
    @State private var query = ""

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                let results = store.search(query: query)
                VStack(alignment: .leading, spacing: 18) {
                    SectionHeader(
                        title: store.text(ar: "البحث", en: "Search"),
                        subtitle: store.text(ar: "يبحث عبر الأحداث، المهام، والمواقع", en: "Search across events, tasks, and places")
                    )
                    .padding(.top, 22)

                    HStack(spacing: 10) {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(.white.opacity(0.70))
                        TextField(store.text(ar: "ابحث عن رحلة، اجتماع، أو موقع", en: "Search meetings, flights, or places"), text: $query)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .foregroundStyle(.white)
                    }
                    .padding(16)
                    .liquidGlass(style: .primary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 24)

                    if query.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(store.searchSuggestions, id: \.self) { suggestion in
                                    Button {
                                        query = suggestion
                                    } label: {
                                        GlassChip(text: suggestion, tint: store.settings.accent.primary)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }

                    resultSection(title: store.text(ar: "الأحداث", en: "Events")) {
                        if results.events.isEmpty {
                            EmptyStateCard(
                                title: store.text(ar: "لا نتائج", en: "No matching events"),
                                subtitle: store.text(ar: "جرّب عنوانًا أو مدينة أو شخصًا.", en: "Try an event name, city, or person."),
                                tint: store.settings.accent.primary
                            )
                        } else {
                            ForEach(results.events) { event in
                                EventCard(event: event, isFocused: false, isConflict: false, isPast: event.endsAt < .now)
                                    .onTapGesture { store.selectedEvent = event }
                            }
                        }
                    }

                    resultSection(title: store.text(ar: "المهام", en: "Tasks")) {
                        ForEach(results.tasks) { task in
                            TaskRow(task: task)
                        }
                    }

                    resultSection(title: store.text(ar: "المواقع", en: "Locations")) {
                        if results.locations.isEmpty {
                            EmptyStateCard(
                                title: store.text(ar: "لا مواقع مطابقة", en: "No matching places"),
                                subtitle: store.text(ar: "المواقع المستخدمة في الأحداث ستظهر هنا.", en: "Locations used in events will appear here."),
                                tint: store.settings.accent.primary
                            )
                        } else {
                            ForEach(results.locations, id: \.self) { location in
                                HStack {
                                    Image(systemName: "mappin.circle.fill")
                                        .foregroundStyle(store.settings.accent.primary)
                                    Text(location)
                                        .font(.system(size: 15, weight: .semibold, design: .rounded))
                                        .foregroundStyle(.white)
                                    Spacer()
                                }
                                .padding(16)
                                .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 22)
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 120)
            }
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private func resultSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            content()
        }
    }
}

struct SettingsView: View {
    @EnvironmentObject private var store: NahrStore

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    SectionHeader(
                        title: store.text(ar: "الإعدادات", en: "Settings"),
                        subtitle: store.text(ar: "لغة، تقويم، وواجهة Liquid Glass", en: "Language, calendar, and Liquid Glass controls")
                    )
                    .padding(.top, 22)

                    settingsCard(title: store.text(ar: "اللغة والاتجاه", en: "Language & Direction")) {
                        Picker(store.text(ar: "اللغة", en: "Language"), selection: $store.settings.language) {
                            ForEach(AppLanguage.allCases) { language in
                                Text(language.title).tag(language)
                            }
                        }
                        .pickerStyle(.segmented)

                        Picker(store.text(ar: "الاتجاه", en: "Layout"), selection: $store.settings.layoutPreference) {
                            Text(store.text(ar: "تلقائي", en: "Auto")).tag(LayoutPreference.automatic)
                            Text("RTL").tag(LayoutPreference.rtl)
                            Text("LTR").tag(LayoutPreference.ltr)
                        }
                        .pickerStyle(.segmented)
                    }

                    settingsCard(title: store.text(ar: "التقويم والمظهر", en: "Calendar & Appearance")) {
                        Picker(store.text(ar: "النظام", en: "Calendar system"), selection: $store.settings.calendarSystem) {
                            Text(store.text(ar: "ميلادي", en: "Gregorian")).tag(CalendarSystemPreference.gregorian)
                            Text(store.text(ar: "هجري", en: "Hijri")).tag(CalendarSystemPreference.hijri)
                            Text(store.text(ar: "مزدوج", en: "Dual")).tag(CalendarSystemPreference.dual)
                        }
                        .pickerStyle(.segmented)

                        Picker(store.text(ar: "النمط", en: "Appearance"), selection: $store.settings.appearance) {
                            Text(store.text(ar: "النظام", en: "System")).tag(AppearanceMode.system)
                            Text(store.text(ar: "فاتح", en: "Light")).tag(AppearanceMode.light)
                            Text(store.text(ar: "داكن", en: "Dark")).tag(AppearanceMode.dark)
                        }
                        .pickerStyle(.segmented)

                        VStack(alignment: .leading, spacing: 8) {
                            Text(store.text(ar: "شدة الزجاج", en: "Glass intensity"))
                                .foregroundStyle(.white.opacity(0.72))
                            Slider(value: $store.settings.glassIntensity, in: 0.35...1.0)
                                .tint(store.settings.accent.primary)
                        }
                    }

                    settingsCard(title: store.text(ar: "تخصيص سريع", en: "Quick Customization")) {
                        Picker(store.text(ar: "لون التمييز", en: "Accent"), selection: $store.settings.accent) {
                            ForEach(AccentPalette.allCases) { accent in
                                Text(accent.rawValue.capitalized).tag(accent)
                            }
                        }
                        .pickerStyle(.segmented)

                        Toggle(store.text(ar: "إظهار أوقات الصلاة", en: "Show prayer times"), isOn: $store.settings.showsPrayerTimes)
                            .tint(store.settings.accent.primary)
                        Toggle(store.text(ar: "كثافة أعلى للجدول", en: "Dense calendar layout"), isOn: $store.settings.denseLayout)
                            .tint(store.settings.accent.primary)
                    }

                    widgetPreviewSection

                    Text(store.text(ar: "شراء مرة واحدة. لا اشتراك. هذه الواجهة هي أساس v1 مع مسار واضح لإضافة EventKit وWidgetKit والمزامنة لاحقًا.", en: "One-time purchase. No subscription. This build establishes the v1 UI foundation with a clear path to EventKit, WidgetKit, and sync adapters."))
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.68))
                        .padding(.bottom, 120)
                }
                .padding(.horizontal, 20)
            }
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private func settingsCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(title)
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            content()
                .tint(store.settings.accent.primary)
        }
        .padding(18)
        .liquidGlass(style: .primary, tint: store.settings.accent.primary.opacity(0.16), cornerRadius: 28)
    }

    private var widgetPreviewSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(store.text(ar: "معاينات الويدجت", en: "Widget Previews"))
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            HStack(alignment: .top, spacing: 12) {
                widgetTile(title: store.text(ar: "صغير", en: "Small"), subtitle: store.text(ar: "الحدث القادم", en: "Next event"), width: 110, height: 110)
                widgetTile(title: store.text(ar: "متوسط", en: "Medium"), subtitle: store.text(ar: "3 عناصر أجندة", en: "3 agenda rows"), width: 180, height: 110)
            }
            widgetTile(title: store.text(ar: "شاشة القفل", en: "Lock Screen"), subtitle: store.text(ar: "هجري + صلاة + حدث", en: "Hijri + prayer + event"), width: nil, height: 82)
        }
    }

    private func widgetTile(title: String, subtitle: String, width: CGFloat?, height: CGFloat) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            Text(subtitle)
                .font(.system(size: 12, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.70))
            Spacer(minLength: 0)
            Capsule()
                .fill(store.settings.accent.primary.opacity(0.42))
                .frame(width: width == nil ? 120 : 72, height: 8)
        }
        .padding(16)
        .frame(width: width, height: height, alignment: .topLeading)
        .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 24)
    }
}

struct QuickAddView: View {
    @EnvironmentObject private var store: NahrStore
    @Environment(\.dismiss) private var dismiss
    @FocusState private var focused: Bool
    @State private var input = ""

    private var parsed: QuickAddParseResult {
        NaturalLanguageParser.parse(input, relativeTo: store.selectedDate)
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 18) {
                SectionHeader(
                    title: store.text(ar: "إضافة سريعة", en: "Quick Add"),
                    subtitle: store.text(ar: "اكتب جملة واحدة وسيتم تحليلها فورًا", en: "Type one sentence and the app parses it live")
                )

                TextField(store.text(ar: "أضف حدثًا...", en: "Add event..."), text: $input, axis: .vertical)
                    .textFieldStyle(.plain)
                    .focused($focused)
                    .padding(18)
                    .foregroundStyle(.white)
                    .liquidGlass(style: .primary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 24)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        suggestion(text: store.text(ar: "غدًا 3 مساءً", en: "Tomorrow 3pm"))
                        suggestion(text: store.text(ar: "في المكتب", en: "At the studio"))
                        suggestion(text: store.text(ar: "مع أحمد", en: "With Ahmed"))
                    }
                }

                HStack(spacing: 10) {
                    if let dateText = parsed.detectedDateText {
                        GlassChip(text: dateText, tint: store.settings.accent.primary, systemImage: "calendar.badge.clock")
                    }
                    if let timeText = parsed.detectedTimeText {
                        GlassChip(text: timeText, tint: Color.blue, systemImage: "clock")
                    }
                    if let location = parsed.location {
                        GlassChip(text: location, tint: Color.orange, systemImage: "mappin")
                    }
                    ForEach(parsed.invitees, id: \.self) { invitee in
                        GlassChip(text: invitee, tint: Color.pink, systemImage: "person.fill")
                    }
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text(store.text(ar: "المعاينة", en: "Preview"))
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)

                    VStack(alignment: .leading, spacing: 8) {
                        Text(parsed.title)
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                        Text(DateFormatting.dualDate(for: parsed.startDate, language: store.settings.language, preference: store.settings.calendarSystem))
                            .foregroundStyle(.white.opacity(0.72))
                        Text(DateFormatting.timeRange(start: parsed.startDate, end: parsed.endDate, language: store.settings.language))
                            .foregroundStyle(.white.opacity(0.72))
                        if let location = parsed.location {
                            Label(location, systemImage: "location")
                                .foregroundStyle(.white.opacity(0.72))
                        }
                    }
                    .padding(18)
                    .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 24)
                }

                Spacer(minLength: 0)
            }
            .padding(20)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(store.text(ar: "إضافة", en: "Add")) {
                        store.addEvent(from: input)
                        dismiss()
                    }
                    .disabled(input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                focused = true
            }
        }
    }

    private func suggestion(text: String) -> some View {
        Button {
            input = input.isEmpty ? text : input + " " + text
        } label: {
            GlassChip(text: text, tint: store.settings.accent.primary)
        }
        .buttonStyle(.plain)
    }
}

struct EventDetailView: View {
    @EnvironmentObject private var store: NahrStore
    let event: CalendarEvent

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 10) {
                    Text(event.title)
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    Text(DateFormatting.timeRange(start: event.startsAt, end: event.endsAt, language: store.settings.language))
                        .font(.system(size: 15, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white.opacity(0.78))
                    Text(event.calendarName)
                        .font(.system(size: 13, weight: .semibold, design: .rounded))
                        .foregroundStyle(event.accent.color)
                }
                .padding(22)
                .liquidGlass(style: .accent, tint: event.accent.color.opacity(0.50), cornerRadius: 28)

                detailCard(title: store.text(ar: "الموقع والتنقل", en: "Location & Travel")) {
                    if let location = event.location {
                        Label(location, systemImage: "mappin.and.ellipse")
                    }
                    if let travelMinutes = event.travelMinutes {
                        Label(store.text(ar: "تحرك قبل \(travelMinutes) دقيقة", en: "Leave \(travelMinutes) minutes early"), systemImage: "car.fill")
                    }
                }

                detailCard(title: store.text(ar: "الطقس والملاحظات", en: "Weather & Notes")) {
                    if let weatherSummary = event.weatherSummary {
                        Label(weatherSummary, systemImage: "cloud.sun.fill")
                    }
                    Text(event.notes.isEmpty ? store.text(ar: "بدون ملاحظات", en: "No notes yet") : event.notes)
                }

                detailCard(title: store.text(ar: "المدعوون", en: "Invitees")) {
                    if event.participants.isEmpty {
                        Text(store.text(ar: "لا يوجد مدعوون", en: "No invitees"))
                    } else {
                        ForEach(event.participants) { participant in
                            Text(participant.name)
                        }
                    }
                }
            }
            .padding(20)
        }
    }

    private func detailCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            VStack(alignment: .leading, spacing: 10) {
                content()
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.80))
            }
        }
        .padding(18)
        .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 24)
    }
}

struct OnboardingView: View {
    @EnvironmentObject private var store: NahrStore
    @State private var page = 0

    private let pages: [(icon: String, arTitle: String, enTitle: String, arBody: String, enBody: String)] = [
        ("sparkles.rectangle.stack.fill", "تقويم عربي أولًا", "Arabic-first Calendar", "واجهة مصممة للعربية والاتجاه RTL بدون حلول ملتوية.", "A calendar designed for Arabic and RTL natively."),
        ("text.cursor", "إضافة سريعة ذكية", "Natural Quick Add", "اكتب جملة واحدة وسيقوم نهر بفهم الوقت والمكان فورًا.", "Type one sentence and Nahr extracts time and place instantly."),
        ("rectangle.grid.2x2.fill", "ويدجت وشاشة قفل", "Widgets & Lock Screen", "معاينات جاهزة لأجندة اليوم، الحدث القادم، والتاريخ الهجري.", "Preview-ready widgets for agenda, next event, and Hijri date."),
        ("checkmark.circle.fill", "ابدأ التنظيم", "Start Organizing", "النسخة الحالية تضع أساس v1 بالكامل لتوسيعها لاحقًا بالمزامنة والتكاملات.", "This build establishes the full v1 foundation for later sync and integrations.")
    ]

    var body: some View {
        ZStack {
            LiquidBackground(accent: store.settings.accent.primary)
                .ignoresSafeArea()

            VStack(spacing: 18) {
                TabView(selection: $page) {
                    ForEach(Array(pages.enumerated()), id: \.offset) { index, pageData in
                        VStack(spacing: 22) {
                            Spacer()
                            Image(systemName: pageData.icon)
                                .font(.system(size: 72))
                                .foregroundStyle(.white)
                            Text(store.text(ar: pageData.arTitle, en: pageData.enTitle))
                                .font(.system(size: 30, weight: .bold, design: .rounded))
                                .foregroundStyle(.white)
                            Text(store.text(ar: pageData.arBody, en: pageData.enBody))
                                .font(.system(size: 16, weight: .medium, design: .rounded))
                                .multilineTextAlignment(.center)
                                .foregroundStyle(.white.opacity(0.78))
                                .padding(.horizontal, 24)
                            Spacer()
                        }
                        .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))

                Button(page == pages.count - 1 ? store.text(ar: "ابدأ", en: "Get Started") : store.text(ar: "التالي", en: "Continue")) {
                    if page == pages.count - 1 {
                        store.completeOnboarding()
                    } else {
                        withAnimation(.spring(response: 0.34, dampingFraction: 0.84)) {
                            page += 1
                        }
                    }
                }
                .font(.system(size: 17, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .liquidGlass(style: .accent, tint: store.settings.accent.primary.opacity(0.42), cornerRadius: 24)
                .padding(.horizontal, 24)
                .padding(.bottom, 34)
            }
        }
    }
}

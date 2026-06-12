import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var store: NahrStore
    @Environment(\.layoutDirection) private var layoutDirection
    @State private var headerOffset: CGFloat = 0
    @State private var expandedEventID: CalendarEvent.ID?

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 18) {
                        GeometryReader { proxy in
                            Color.clear
                                .preference(key: ScrollOffsetKey.self, value: proxy.frame(in: .named("home-scroll")).minY)
                        }
                        .frame(height: 0)

                        heroHeader
                        dayTicker
                        modePicker

                        if store.homeMode == .timeline {
                            timelineSection
                        } else {
                            agendaSection
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 22)
                    .padding(.bottom, 120)
                }
                .coordinateSpace(name: "home-scroll")
                .onPreferenceChange(ScrollOffsetKey.self) { value in
                    headerOffset = value
                }
                .simultaneousGesture(dayNavigationGesture)
                .simultaneousGesture(densityGesture)

                Button {
                    store.showQuickAdd = true
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 62, height: 62)
                        .background(Circle().fill(store.settings.accent.primary.opacity(0.42)))
                        .overlay {
                            Circle().stroke(Color.white.opacity(0.28), lineWidth: 1)
                        }
                        .shadow(color: store.settings.accent.primary.opacity(0.36), radius: 20, x: 0, y: 10)
                }
                .buttonStyle(.plain)
                .padding(.trailing, 26)
                .padding(.bottom, 110)
            }
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private var heroHeader: some View {
        let collapseProgress = min(max(-headerOffset / 120, 0), 1)

        return VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("نهر")
                        .font(.system(size: 34 - (collapseProgress * 8), weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    Text(store.text(ar: "تدفق الوقت، بتنظيم أجمل", en: "Flowing time, beautifully organized"))
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.74 - (collapseProgress * 0.20)))
                }

                Spacer()

                Image(systemName: "person.crop.circle.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(.white.opacity(0.82))
            }

            HStack(spacing: 10) {
                GlassChip(
                    text: DateFormatting.dualDate(for: store.selectedDate, language: store.settings.language, preference: store.settings.calendarSystem),
                    tint: store.settings.accent.primary,
                    systemImage: "calendar"
                )
                if store.settings.showsPrayerTimes {
                    GlassChip(text: store.text(ar: "العصر 3:27", en: "Asr 3:27"), tint: Color.orange, systemImage: "sparkles")
                }
            }

            if collapseProgress < 0.55 {
                HStack(spacing: 10) {
                    GlassChip(text: DateFormatting.monthTitle(for: store.selectedDate, language: store.settings.language), tint: Color.white.opacity(0.2), systemImage: "cloud.sun")
                    GlassChip(text: store.text(ar: "26° صافٍ", en: "26° clear"), tint: Color.blue.opacity(0.45), systemImage: "sun.max")
                }
                .transition(.opacity.combined(with: .scale(scale: 0.92)))
            }
        }
        .padding(20)
        .liquidGlass(style: .primary, tint: store.settings.accent.primary, cornerRadius: 30)
        .scaleEffect(x: 1, y: 1 - (collapseProgress * 0.06), anchor: .top)
        .animation(MotionTokens.smooth, value: collapseProgress)
    }

    private var dayTicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(store.visibleDates, id: \.self) { date in
                    let isSelected = Calendar.current.isDate(date, inSameDayAs: store.selectedDate)
                    let count = store.events(for: date).count
                    Button {
                        store.select(date: date)
                    } label: {
                        VStack(spacing: 10) {
                            Text(DateFormatting.dayName(for: date, language: store.settings.language, short: true))
                                .font(.system(size: 12, weight: .semibold, design: .rounded))
                                .foregroundStyle(.white.opacity(isSelected ? 0.98 : 0.70))
                            Text("\(Calendar.current.component(.day, from: date))")
                                .font(.system(size: 22, weight: .bold, design: .rounded))
                                .foregroundStyle(.white)
                            HStack(spacing: 4) {
                                ForEach(0..<min(count, 3), id: \.self) { _ in
                                    Circle()
                                        .fill(isSelected ? Color.white : store.settings.accent.primary)
                                        .frame(width: 5, height: 5)
                                }
                            }
                            .frame(height: 6)
                        }
                        .frame(width: 74, height: 112)
                        .background {
                            RoundedRectangle(cornerRadius: 24, style: .continuous)
                                .fill(isSelected ? store.settings.accent.primary.opacity(0.46) : Color.white.opacity(0.05))
                        }
                        .overlay {
                            RoundedRectangle(cornerRadius: 24, style: .continuous)
                                .stroke(Color.white.opacity(isSelected ? 0.32 : 0.10), lineWidth: 1)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(8)
        }
        .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 28)
    }

    private var modePicker: some View {
        HStack(spacing: 10) {
            modeButton(.timeline, ar: "الخط الزمني", en: "Timeline")
            modeButton(.agenda, ar: "الأجندة", en: "Agenda")
        }
        .padding(6)
        .liquidGlass(style: .secondary, tint: .white.opacity(0.08), cornerRadius: 24)
    }

    private func modeButton(_ mode: HomeDisplayMode, ar: String, en: String) -> some View {
        Button {
            withAnimation(MotionTokens.snappy) {
                store.homeMode = mode
            }
        } label: {
            Text(store.text(ar: ar, en: en))
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .foregroundStyle(.white)
                .background {
                    if store.homeMode == mode {
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(store.settings.accent.primary.opacity(0.36))
                    }
                }
        }
        .buttonStyle(.plain)
    }

    private var timelineSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(
                title: store.text(ar: "جدول اليوم", en: "Day Timeline"),
                subtitle: store.text(ar: "الأحداث المتداخلة تظهر بطبقات زجاجية", en: "Events stack in layered glass cards")
            )

            if store.selectedDayEvents.isEmpty {
                EmptyStateCard(
                    title: store.text(ar: "لا توجد أحداث لهذا اليوم", en: "No events for this day"),
                    subtitle: store.text(ar: "استخدم الإضافة السريعة لبدء يوم جديد بسرعة.", en: "Use Quick Add to start filling the day."),
                    tint: store.settings.accent.primary
                )
            } else {
                ForEach(timelineHours, id: \.self) { hour in
                    let hourEvents = store.selectedDayEvents.filter { Calendar.current.component(.hour, from: $0.startsAt) == hour }
                    HStack(alignment: .top, spacing: 14) {
                        Text(hourLabel(hour))
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .foregroundStyle(.white.opacity(0.66))
                            .frame(width: 54, alignment: .leading)

                        VStack(alignment: .leading, spacing: 12) {
                            Capsule()
                                .fill(Color.white.opacity(0.10))
                                .frame(height: 1)
                                .overlay(alignment: .leading) {
                                    if isCurrentHour(hour) {
                                        Capsule()
                                            .fill(store.settings.accent.primary)
                                            .frame(width: 68, height: 3)
                                    }
                                }

                            if hourEvents.isEmpty {
                                Color.clear.frame(height: store.settings.denseLayout ? 4 : 8)
                            } else {
                                ForEach(hourEvents) { event in
                                    EventCard(
                                        event: event,
                                        isFocused: expandedEventID == event.id,
                                        isConflict: hasConflict(event),
                                        isPast: event.endsAt < .now
                                    )
                                        .onTapGesture {
                                            withAnimation(MotionTokens.expanded) {
                                                expandedEventID = expandedEventID == event.id ? nil : event.id
                                            }
                                        }
                                        .onLongPressGesture {
                                            store.selectedEvent = event
                                        }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private var agendaSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(
                title: store.text(ar: "الأجندة الذكية", en: "Smart Agenda"),
                subtitle: store.text(ar: "مجمعة إلى اليوم، غدًا، والقادم", en: "Grouped into today, tomorrow, and upcoming")
            )

            if store.agendaSections().isEmpty {
                EmptyStateCard(
                    title: store.text(ar: "الأسبوع يبدو هادئًا", en: "The week looks clear"),
                    subtitle: store.text(ar: "أضف موعدًا أو مهمة ليظهر هنا تلقائيًا.", en: "Add an event or task and it will appear here automatically."),
                    tint: store.settings.accent.primary
                )
            } else {
                ForEach(store.unifiedAgendaSections()) { section in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(section.title)
                            .font(.system(size: 19, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)

                        ForEach(section.entries, id: \.id) { entry in
                            switch entry {
                            case .event(let event):
                                EventCard(
                                    event: event,
                                    isFocused: expandedEventID == event.id,
                                    isConflict: hasConflict(event),
                                    isPast: event.endsAt < .now
                                )
                                .onTapGesture {
                                    withAnimation(MotionTokens.expanded) {
                                        expandedEventID = expandedEventID == event.id ? nil : event.id
                                    }
                                }
                                .onLongPressGesture {
                                    store.selectedEvent = event
                                }
                            case .task(let task):
                                AgendaTaskCard(task: task)
                            }
                        }
                    }
                }
            }
        }
    }

    private var timelineHours: [Int] { Array(store.settings.denseLayout ? 7...22 : 6...23) }

    private func isCurrentHour(_ hour: Int) -> Bool {
        Calendar.current.isDateInToday(store.selectedDate) && Calendar.current.component(.hour, from: .now) == hour
    }

    private func hourLabel(_ hour: Int) -> String {
        let date = Calendar.current.date(bySettingHour: hour, minute: 0, second: 0, of: store.selectedDate) ?? store.selectedDate
        return DateFormatting.time(for: date, language: store.settings.language)
    }

    private var dayNavigationGesture: some Gesture {
        DragGesture(minimumDistance: 28)
            .onEnded { value in
                guard abs(value.translation.width) > abs(value.translation.height) else { return }
                let isRTL = layoutDirection == .rightToLeft
                if value.translation.width < -45 {
                    store.moveSelectedDate(by: isRTL ? -1 : 1)
                } else if value.translation.width > 45 {
                    store.moveSelectedDate(by: isRTL ? 1 : -1)
                }
            }
    }

    private var densityGesture: some Gesture {
        MagnifyGesture()
            .onEnded { value in
                if value.magnification > 1.08 {
                    withAnimation(MotionTokens.smooth) {
                        store.settings.denseLayout = false
                    }
                } else if value.magnification < 0.94 {
                    withAnimation(MotionTokens.smooth) {
                        store.settings.denseLayout = true
                    }
                }
            }
    }

    private func hasConflict(_ event: CalendarEvent) -> Bool {
        store.selectedDayEvents.contains { other in
            other.id != event.id && other.startsAt < event.endsAt && other.endsAt > event.startsAt
        }
    }
}

struct EventCard: View {
    @EnvironmentObject private var store: NahrStore
    let event: CalendarEvent
    let isFocused: Bool
    let isConflict: Bool
    let isPast: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(event.title)
                        .font(.system(size: 17, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    Text(DateFormatting.timeRange(start: event.startsAt, end: event.endsAt, language: store.settings.language))
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.72))
                }

                Spacer()

                Circle()
                    .fill(event.accent.color)
                    .frame(width: 10, height: 10)
            }

            if let location = event.location {
                Label(location, systemImage: "mappin.and.ellipse")
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.76))
            }

            HStack(spacing: 8) {
                ForEach(event.participants.prefix(3)) { participant in
                    Text(participant.initials)
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .frame(width: 28, height: 28)
                        .background(Circle().fill(Color.white.opacity(0.14)))
                }

                if let travelMinutes = event.travelMinutes {
                    GlassChip(text: store.text(ar: "تحرك قبل \(travelMinutes) د", en: "Leave in \(travelMinutes)m"), tint: event.accent.color)
                }
                if isConflict {
                    GlassChip(text: store.text(ar: "تعارض", en: "Conflict"), tint: .red, systemImage: "exclamationmark.triangle.fill")
                }
            }
        }
        .padding(16)
        .liquidGlass(style: .accent, tint: event.accent.color.opacity(0.54), cornerRadius: 24)
        .overlay {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(isConflict ? Color.red.opacity(0.72) : Color.white.opacity(isFocused ? 0.30 : 0.0), lineWidth: isConflict ? 1.5 : 1)
        }
        .opacity(isPast ? 0.62 : 1.0)
        .scaleEffect(isFocused ? 1.02 : 1.0)
        .shadow(color: event.accent.color.opacity(isFocused ? 0.42 : 0.18), radius: isFocused ? 26 : 16, x: 0, y: isFocused ? 16 : 10)
        .animation(MotionTokens.smooth, value: isFocused)
    }
}

private struct AgendaTaskCard: View {
    @EnvironmentObject private var store: NahrStore
    let task: NahrTask

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: task.completed ? "checkmark.circle.fill" : "circle.dotted")
                .foregroundStyle(task.completed ? Color.green : store.settings.accent.primary)
                .font(.system(size: 20, weight: .semibold))

            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(task.completed ? 0.58 : 1))
                if let dueDate = task.dueDate {
                    Text(DateFormatting.time(for: dueDate, language: store.settings.language))
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                        .foregroundStyle(.white.opacity(0.66))
                }
            }

            Spacer()
        }
        .padding(14)
        .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(task.completed ? 0.08 : 0.16), cornerRadius: 20)
    }
}

private struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0

    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

import SwiftUI

struct PlannerView: View {
    @EnvironmentObject private var store: NahrStore

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    SectionHeader(
                        title: store.text(ar: "المخطط", en: "Planner"),
                        subtitle: DateFormatting.monthTitle(for: store.selectedDate, language: store.settings.language)
                    )
                    .padding(.top, 22)

                    HStack(spacing: 10) {
                        pickerButton(.month, ar: "الشهر", en: "Month")
                        pickerButton(.week, ar: "الأسبوع", en: "Week")
                    }
                    .padding(6)
                    .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 24)

                    if store.plannerMode == .month {
                        MonthPlannerView()
                    } else {
                        WeekPlannerView()
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 120)
            }
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private func pickerButton(_ mode: PlannerDisplayMode, ar: String, en: String) -> some View {
        Button {
            withAnimation(.spring(response: 0.34, dampingFraction: 0.84)) {
                store.plannerMode = mode
            }
        } label: {
            Text(store.text(ar: ar, en: en))
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .foregroundStyle(.white)
                .background {
                    if store.plannerMode == mode {
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(store.settings.accent.primary.opacity(0.36))
                    }
                }
        }
        .buttonStyle(.plain)
    }
}

private struct MonthPlannerView: View {
    @EnvironmentObject private var store: NahrStore

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            weekdayHeader
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 7), spacing: 12) {
                ForEach(monthCells.indices, id: \.self) { index in
                    let date = monthCells[index]
                    if let date {
                        let selected = Calendar.current.isDate(date, inSameDayAs: store.selectedDate)
                        Button {
                            store.select(date: date)
                        } label: {
                            VStack(spacing: 8) {
                                Text("\(Calendar.current.component(.day, from: date))")
                                    .font(.system(size: 16, weight: .bold, design: .rounded))
                                    .foregroundStyle(.white)
                                HStack(spacing: 4) {
                                    ForEach(0..<min(store.events(for: date).count, 3), id: \.self) { _ in
                                        Circle().fill(selected ? Color.white : store.settings.accent.primary).frame(width: 4, height: 4)
                                    }
                                }
                                .frame(height: 5)
                            }
                            .frame(maxWidth: .infinity, minHeight: 68)
                            .background {
                                RoundedRectangle(cornerRadius: 20, style: .continuous)
                                    .fill(selected ? store.settings.accent.primary.opacity(0.46) : Color.white.opacity(0.04))
                            }
                            .overlay {
                                RoundedRectangle(cornerRadius: 20, style: .continuous)
                                    .stroke(Color.white.opacity(selected ? 0.28 : 0.08), lineWidth: 1)
                            }
                        }
                        .buttonStyle(.plain)
                    } else {
                        Color.clear.frame(height: 68)
                    }
                }
            }
            .padding(16)
            .liquidGlass(style: .primary, tint: store.settings.accent.primary.opacity(0.16), cornerRadius: 30)

            VStack(alignment: .leading, spacing: 10) {
                Text(store.text(ar: "تفاصيل اليوم المحدد", en: "Selected Day"))
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                if store.selectedDayEvents.isEmpty {
                    EmptyStateCard(
                        title: store.text(ar: "لا توجد مواعيد", en: "Nothing scheduled"),
                        subtitle: store.text(ar: "سيظهر كل شيء هنا عند اختيار يوم مزدحم.", en: "Busy days expand here with full detail."),
                        tint: store.settings.accent.primary
                    )
                } else {
                    ForEach(store.selectedDayEvents) { event in
                        EventCard(
                            event: event,
                            isFocused: false,
                            isConflict: store.selectedDayEvents.contains { other in
                                other.id != event.id && other.startsAt < event.endsAt && other.endsAt > event.startsAt
                            },
                            isPast: event.endsAt < .now
                        )
                            .onTapGesture { store.selectedEvent = event }
                    }
                }
            }
        }
    }

    private var monthCells: [Date?] {
        let calendar = store.configuredCalendar
        let monthInterval = calendar.dateInterval(of: .month, for: store.selectedDate)
        let monthStart = monthInterval?.start ?? store.selectedDate
        let dayRange = calendar.range(of: .day, in: .month, for: monthStart) ?? 1..<29
        let weekday = calendar.component(.weekday, from: monthStart)
        let leadingSpaces = (weekday - calendar.firstWeekday + 7) % 7
        var cells = Array<Date?>(repeating: nil, count: leadingSpaces)
        cells.append(contentsOf: dayRange.compactMap { day in
            calendar.date(bySetting: .day, value: day, of: monthStart)
        })
        return cells
    }

    private var weekdayHeader: some View {
        HStack {
            ForEach(DateFormatting.weekdaySymbols(language: store.settings.language, weekStart: store.settings.weekStart), id: \.self) { symbol in
                Text(symbol)
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.68))
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 8)
    }
}

private struct WeekPlannerView: View {
    @EnvironmentObject private var store: NahrStore

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 14) {
                ForEach(store.weekDates, id: \.self) { date in
                    VStack(alignment: .leading, spacing: 12) {
                        Text(DateFormatting.dayName(for: date, language: store.settings.language, short: false))
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                        Text(DateFormatting.dualDate(for: date, language: store.settings.language, preference: store.settings.calendarSystem))
                            .font(.system(size: 11, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.62))

                        ForEach(store.events(for: date)) { event in
                            EventCard(
                                event: event,
                                isFocused: false,
                                isConflict: store.events(for: date).contains { other in
                                    other.id != event.id && other.startsAt < event.endsAt && other.endsAt > event.startsAt
                                },
                                isPast: event.endsAt < .now
                            )
                                .frame(width: 260)
                                .onTapGesture { store.selectedEvent = event }
                        }

                        if store.events(for: date).isEmpty {
                            EmptyStateCard(
                                title: store.text(ar: "اليوم مفتوح", en: "Open day"),
                                subtitle: store.text(ar: "مناسب لوضع مهام أو حجوزات جديدة.", en: "A good slot for new plans or tasks."),
                                tint: store.settings.accent.primary
                            )
                            .frame(width: 260)
                        }
                    }
                    .padding(16)
                    .frame(width: 292)
                    .liquidGlass(style: .primary, tint: store.settings.accent.primary.opacity(0.16), cornerRadius: 28)
                }
            }
            .padding(.vertical, 2)
        }
    }
}

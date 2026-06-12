import SwiftUI

// MARK: - Model

struct ChatMessage: Identifiable {
    let id = UUID()
    let content: String
    let isUser: Bool
    let timestamp: Date
}

// MARK: - Ask / Chat View

struct AskView: View {
    @EnvironmentObject var vm: HealthViewModel
    @Environment(\.colorScheme) var colorScheme

    @State private var messageText: String = ""
    @State private var messages: [ChatMessage] = [
        ChatMessage(
            content: "Hi! I'm your Health AI assistant 👋\nAsk me anything about your metrics, scores, or how to improve your health.",
            isUser: false,
            timestamp: Date()
        )
    ]
    @State private var isTyping: Bool = false
    @FocusState private var inputFocused: Bool

    private let accentColor = Color(red: 0.35, green: 0.85, blue: 0.60)

    var body: some View {
        VStack(spacing: 0) {
            messagesArea
            inputBar
        }
        .background(Color(.systemBackground).ignoresSafeArea())
    }

    // MARK: - Messages

    private var messagesArea: some View {
        ScrollViewReader { proxy in
            ScrollView(showsIndicators: false) {
                VStack {
                    LazyVStack(spacing: 14) {
                        ForEach(messages) { msg in
                            MessageBubbleView(message: msg)
                        }

                        if isTyping {
                            TypingIndicator()
                                .id("typing")
                        }

                        Color.clear
                            .frame(height: 8)
                            .id("bottom")
                    }
                    .frame(maxWidth: 860)
                    .padding(.horizontal, 16)
                    .padding(.top, 16)
                    .padding(.bottom, 8)
                }
                .frame(maxWidth: .infinity)
            }
            .onChange(of: messages.count) { _, _ in
                withAnimation(.easeOut(duration: 0.25)) {
                    proxy.scrollTo("bottom", anchor: .bottom)
                }
            }
            .onChange(of: isTyping) { _, _ in
                withAnimation(.easeOut(duration: 0.2)) {
                    proxy.scrollTo("bottom", anchor: .bottom)
                }
            }
        }
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(alignment: .bottom, spacing: 10) {
            TextField("Ask about your health...", text: $messageText, axis: .vertical)
                .font(.system(size: 15))
                .foregroundColor(textPrimary)
                .lineLimit(1...5)
                .padding(.horizontal, 14)
                .padding(.vertical, 11)
                .background(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(inputBg)
                )
                .focused($inputFocused)

            Button { sendMessage() } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 34))
                    .foregroundColor(
                        messageText.trimmingCharacters(in: .whitespaces).isEmpty
                            ? sendDisabledColor
                            : accentColor
                    )
            }
            .disabled(messageText.trimmingCharacters(in: .whitespaces).isEmpty)
            .animation(.easeInOut(duration: 0.15), value: messageText.isEmpty)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color(.systemBackground))
    }

    // MARK: - Logic

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }

        withAnimation {
            messages.append(ChatMessage(content: text, isUser: true, timestamp: Date()))
            messageText = ""
            isTyping = true
        }

        let delay = Double.random(in: 0.8...1.6)
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
            withAnimation {
                isTyping = false
                messages.append(ChatMessage(
                    content: generateResponse(for: text),
                    isUser: false,
                    timestamp: Date()
                ))
            }
        }
    }

    private func generateResponse(for query: String) -> String {
        let q = query.lowercased()

        if q.contains("score") || q.contains("overall") || q.contains("grade") {
            return "Your overall health score is **\(Int(vm.overallScore))/100** (Grade \(vm.overallGrade)) — that's **\(vm.overallStatus.label)**. \(scoreInsight())"
        }
        if q.contains("bio") || q.contains("age") || q.contains("biological") {
            let delta = vm.biologicalAgeDelta
            let direction = delta >= 0 ? "younger" : "older"
            let emoji = delta >= 0 ? "🎉" : "⚠️"
            return "Your biological age is estimated at **\(vm.biologicalAge)** vs your actual age of **\(vm.userAge)**. That's \(abs(delta)) years \(direction)! \(emoji)\n\n\(delta >= 0 ? "Great work — keep it up!" : "Focus on your weakest categories to bring your bio age down.")"
        }
        if q.contains("improve") || q.contains("worst") || q.contains("weak") || q.contains("bad") {
            if let weakest = vm.weakestCategory {
                return "Your biggest opportunity is **\(weakest.type.rawValue)** with a score of **\(Int(weakest.score))**. Improving this category will have the highest impact on both your overall score and biological age."
            }
        }
        if q.contains("best") || q.contains("strong") || q.contains("good") {
            if let strongest = vm.strongestCategory {
                return "Your strongest category is **\(strongest.type.rawValue)** with a score of **\(Int(strongest.score))**. You're doing excellently here — keep maintaining these habits!"
            }
        }
        if q.contains("categor") || q.contains("how many") {
            return "You're currently tracking **\(vm.categories.count) health categories**. \(vm.categories.filter { $0.score >= 70 }.count) are on track and \(vm.categories.filter { $0.score < 70 }.count) need attention."
        }
        if q.contains("tip") || q.contains("advice") || q.contains("suggest") || q.contains("help") {
            return tipBasedOnData()
        }

        return "Based on your current data (overall score: **\(Int(vm.overallScore))**, bio age: **\(vm.biologicalAge)**), you're in \(vm.overallStatus.label) health. You can ask me about:\n• Your overall score\n• Specific categories\n• How to improve\n• Biological age insights"
    }

    private func scoreInsight() -> String {
        switch vm.overallScore {
        case 85...100: return "You're in excellent shape — keep up the great habits!"
        case 70..<85:  return "You're doing well. Small improvements in your weakest areas will push you even higher."
        case 50..<70:  return "There's meaningful room to improve. Focus on your lowest-scoring categories first."
        default:       return "Your health needs attention. Consider speaking with a healthcare provider about a structured improvement plan."
        }
    }

    private func tipBasedOnData() -> String {
        if let weakest = vm.weakestCategory {
            return "💡 My top suggestion: focus on **\(weakest.type.rawValue)**. With a score of \(Int(weakest.score)), improving it will have the most leverage on your overall health score and biological age."
        }
        return "💡 Consistency is key. Even small daily improvements across all categories compound into significant health gains over time."
    }

    // MARK: - Colors

    private var inputBg: Color {
        colorScheme == .dark ? Color(white: 0.13) : Color(white: 0.91)
    }

    private var textPrimary: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }

    private var textSecondary: Color {
        colorScheme == .dark ? .white.opacity(0.40) : .black.opacity(0.40)
    }

    private var sendDisabledColor: Color {
        colorScheme == .dark ? .white.opacity(0.18) : .black.opacity(0.18)
    }
}

// MARK: - Message Bubble

struct MessageBubbleView: View {
    let message: ChatMessage
    @Environment(\.colorScheme) var colorScheme

    private let userColor = Color(red: 0.20, green: 0.55, blue: 0.95)
    private let aiColor   = Color(red: 0.35, green: 0.85, blue: 0.60)

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.isUser { Spacer(minLength: 56) }

            if !message.isUser {
                ZStack {
                    Circle()
                        .fill(aiColor.opacity(0.14))
                        .frame(width: 28, height: 28)
                    Image(systemName: "brain.head.profile")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(aiColor)
                }
                .padding(.bottom, 2)
            }

            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .font(.system(size: 15))
                    .foregroundColor(message.isUser ? .white : bubbleText)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 11)
                    .background(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(message.isUser ? userColor : aiBubbleBg)
                            .shadow(
                                color: .black.opacity(colorScheme == .dark ? 0.25 : 0.07),
                                radius: 6, x: 0, y: 2
                            )
                    )

                Text(timeString(from: message.timestamp))
                    .font(.system(size: 10))
                    .foregroundColor(timestampColor)
            }

            if !message.isUser { Spacer(minLength: 56) }
        }
    }

    private var aiBubbleBg: Color {
        colorScheme == .dark ? Color(white: 0.14) : Color.white
    }

    private var bubbleText: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }

    private var timestampColor: Color {
        colorScheme == .dark ? .white.opacity(0.22) : .black.opacity(0.25)
    }

    private func timeString(from date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "h:mm a"
        return f.string(from: date)
    }
}

// MARK: - Typing Indicator

struct TypingIndicator: View {
    @State private var phase: Int = 0
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            ZStack {
                Circle()
                    .fill(Color(red: 0.35, green: 0.85, blue: 0.60).opacity(0.14))
                    .frame(width: 28, height: 28)
                Image(systemName: "brain.head.profile")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(Color(red: 0.35, green: 0.85, blue: 0.60))
            }

            HStack(spacing: 5) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(colorScheme == .dark ? Color.white.opacity(0.45) : Color.black.opacity(0.35))
                        .frame(width: 7, height: 7)
                        .scaleEffect(phase == i ? 1.3 : 0.85)
                        .animation(
                            .easeInOut(duration: 0.4).repeatForever().delay(Double(i) * 0.15),
                            value: phase
                        )
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(colorScheme == .dark ? Color(white: 0.14) : Color.white)
            )

            Spacer(minLength: 56)
        }
        .onAppear {
            phase = 1
        }
    }
}

#Preview {
    AskView().environmentObject(HealthViewModel())
}

import Testing
@testable import Nahr

struct NahrTests {

    @Test func parsesArabicTomorrowEvent() async throws {
        let reference = Date(timeIntervalSince1970: 1_777_171_200)
        let result = NaturalLanguageParser.parse("اجتماع غدًا الساعة 3 في المكتب", relativeTo: reference)

        #expect(result.detectedDateText == "غدًا")
        #expect(result.location == "المكتب")
        #expect(Calendar.current.component(.hour, from: result.startDate) == 3)
    }

    @Test func parsesEnglishPmEvent() async throws {
        let reference = Date(timeIntervalSince1970: 1_777_171_200)
        let result = NaturalLanguageParser.parse("Meeting tomorrow 3pm at Paris", relativeTo: reference)

        #expect(result.detectedDateText == "tomorrow")
        #expect(result.location == "paris")
        #expect(Calendar.current.component(.hour, from: result.startDate) == 15)
    }

    @Test func parsesInviteeAndLooseLocation() async throws {
        let reference = Date(timeIntervalSince1970: 1_777_171_200)
        let result = NaturalLanguageParser.parse("Meeting tomorrow 3pm Paris with Ahmed", relativeTo: reference)

        #expect(result.location == "paris")
        #expect(result.invitees.contains("Ahmed"))
    }

    @Test func storeAddsEventFromQuickInput() async throws {
        let store = await MainActor.run { NahrStore() }
        let initialCount = await MainActor.run { store.events.count }

        await MainActor.run {
            store.addEvent(from: "Lunch tomorrow 1pm at Courtyard")
        }

        let finalCount = await MainActor.run { store.events.count }
        let latest = await MainActor.run { store.events.last }
        #expect(finalCount == initialCount + 1)
        #expect(latest?.title.contains("Lunch") == true)
    }
}

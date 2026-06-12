//
//  ExamModeView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

#if false
// Duplicate disabled. Canonical ExamModeView lives in ExamModeView.swift.
import SwiftUI

// Temporary implementation to satisfy navigation destinations.
// This currently reuses StudyModeView until a dedicated timed exam experience is implemented.
struct ExamModeView: View {
    var body: some View {
        StudyModeView()
            .navigationTitle("Exam Mode")
            .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    ExamModeView()
        .environment(AppState())
}
#endif


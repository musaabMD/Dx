//
//  AppGroupConstants.swift
//  WidgetShared
//

import Foundation

public enum AppGroupConstants {
    public static let groupID = "group.hyperteam.widgets99"

    public static var sharedDefaults: UserDefaults? {
        UserDefaults(suiteName: groupID)
    }

    public enum Keys {
        public static let activeWidgetID        = "activeWidgetID"
        public static let installedWidgetsJSON  = "installedWidgetsJSON_v2"   // v2 = new schema
        public static let snapshotsJSON         = "snapshotsJSON"
        public static let allSnapshotsJSON      = "allSnapshotsJSON_v1"
        // Legacy keys (kept so old data doesn't crash reads)
        public static let activeTemplateID      = "activeTemplateID"
        public static let isPremiumUnlocked     = "isPremiumUnlocked"
    }
}

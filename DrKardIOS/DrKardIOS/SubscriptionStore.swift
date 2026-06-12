import Combine
import Foundation
import StoreKit

@MainActor
final class SubscriptionStore: ObservableObject {
    static let productIDs = [
        "drkard.pro.monthly",
        "drkard.pro.yearly"
    ]

    @Published private(set) var products: [Product] = []
    @Published private(set) var isPro = false
    @Published private(set) var activeProductID: String?
    @Published private(set) var activeExpirationDate: Date?
    @Published var purchaseError: String?
    @Published var isLoadingProducts = false
    @Published var isPurchasing = false

    private var transactionUpdatesTask: Task<Void, Never>?
    private let cacheKey = "drkard.subscription.cache"

    init() {
        restoreCachedEntitlement()
        transactionUpdatesTask = Task { [weak self] in
            for await update in Transaction.updates {
                guard let self else { return }
                if case .verified(let transaction) = update {
                    await transaction.finish()
                    await self.refreshEntitlements()
                }
            }
        }
    }

    deinit {
        transactionUpdatesTask?.cancel()
    }

    func loadProducts() async {
        guard !isLoadingProducts else { return }
        isLoadingProducts = true
        defer { isLoadingProducts = false }

        do {
            products = try await Product.products(for: Self.productIDs).sorted { lhs, rhs in
                (Self.productIDs.firstIndex(of: lhs.id) ?? 0) < (Self.productIDs.firstIndex(of: rhs.id) ?? 0)
            }
            purchaseError = products.isEmpty ? "Subscriptions are not available. Check App Store Connect product IDs." : nil
        } catch {
            purchaseError = error.localizedDescription
        }
    }

    func refreshEntitlements() async {
        var foundPro = false
        var foundProductID: String?
        var foundExpirationDate: Date?

        for await entitlement in Transaction.currentEntitlements {
            guard case .verified(let transaction) = entitlement,
                  Self.productIDs.contains(transaction.productID) else {
                continue
            }
            foundPro = true
            foundProductID = transaction.productID
            foundExpirationDate = transaction.expirationDate
        }

        isPro = foundPro
        activeProductID = foundProductID
        activeExpirationDate = foundExpirationDate
        cacheEntitlement()
    }

    @discardableResult
    func purchase(_ product: Product) async -> Bool {
        isPurchasing = true
        purchaseError = nil
        defer { isPurchasing = false }

        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                guard case .verified(let transaction) = verification else {
                    purchaseError = "Apple could not verify this purchase."
                    return false
                }
                await transaction.finish()
                await refreshEntitlements()
                return isPro
            case .pending:
                purchaseError = "Purchase is pending approval."
                return false
            case .userCancelled:
                return false
            @unknown default:
                purchaseError = "Purchase could not be completed."
                return false
            }
        } catch {
            purchaseError = error.localizedDescription
            return false
        }
    }

    func restorePurchases() async {
        do {
            try await AppStore.sync()
            await refreshEntitlements()
        } catch {
            purchaseError = error.localizedDescription
        }
    }

    private func cacheEntitlement() {
        let cache = SubscriptionEntitlementCache(
            isPro: isPro,
            productID: activeProductID,
            expirationDate: activeExpirationDate,
            lastVerifiedAt: Date()
        )
        if let data = try? JSONEncoder().encode(cache) {
            UserDefaults.standard.set(data, forKey: cacheKey)
        }
    }

    private func restoreCachedEntitlement() {
        guard let data = UserDefaults.standard.data(forKey: cacheKey),
              let cache = try? JSONDecoder().decode(SubscriptionEntitlementCache.self, from: data) else {
            return
        }

        isPro = cache.isPro
        activeProductID = cache.productID
        activeExpirationDate = cache.expirationDate
    }
}

private struct SubscriptionEntitlementCache: Codable {
    let isPro: Bool
    let productID: String?
    let expirationDate: Date?
    let lastVerifiedAt: Date
}

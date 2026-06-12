//
//  SeededRNG.swift
//  WidgetShared
//
//  Deterministic xorshift64 RNG conforming to RandomNumberGenerator.
//  Same seed always produces the same sequence — so a widget style is
//  fully reproducible from an 8-byte seed (sharable as a URL).
//

import Foundation

public struct SeededRNG: RandomNumberGenerator {
    private var state: UInt64

    public init(seed: UInt64) {
        // Avoid degenerate zero state
        state = seed == 0 ? 6_364_136_223_846_793_005 : seed
    }

    public mutating func next() -> UInt64 {
        state ^= state << 13
        state ^= state >> 7
        state ^= state << 17
        return state
    }
}

public extension SeededRNG {
    /// Returns a value in 0..<n
    mutating func nextInt(_ n: Int) -> Int {
        guard n > 0 else { return 0 }
        return Int(next() % UInt64(n))
    }

    /// Returns true with probability p/100
    mutating func chance(_ p: Int) -> Bool {
        nextInt(100) < p
    }
}

public extension Array {
    /// Picks a random element using the provided seeded generator, or nil if empty.
    func seededRandom(using rng: inout SeededRNG) -> Element? {
        guard !isEmpty else { return nil }
        return self[rng.nextInt(count)]
    }
}

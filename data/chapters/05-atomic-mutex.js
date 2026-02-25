var ch5 = {
  id: 5,
  slug: 'atomic-mutex',
  title: 'Atomics & Mutexes',
  description: 'Thread-safe programming with std::atomic, std::mutex, RAII lock guards, condition variables, common concurrency pitfalls, and when to use each tool.',
  level: 'advanced',
  estimatedMinutes: 14,
  tags: ['atomic', 'mutex', 'thread', 'lock_guard', 'deadlock', 'race condition', 'concurrency', 'memory order'],

  sections: [
    {
      id: 'data-races',
      title: 'Data Races & Undefined Behaviour',
      content: `
<p>A <strong>data race</strong> occurs when two or more threads concurrently access the same memory location, at least one access is a write, and there is no synchronization. Data races produce <strong>undefined behaviour</strong> in C++ — not just wrong values, but anything: crashes, silent corruption, or code that "works" on today's build but breaks after optimization.</p>
<p>The two primary synchronization tools are:</p>
<ul>
  <li><code>std::atomic&lt;T&gt;</code> — For simple shared values (counters, flags). Hardware-level atomic operations without explicit locking.</li>
  <li><code>std::mutex</code> + RAII guards — For protecting larger critical sections, complex invariants, or multiple related variables.</li>
</ul>
<div class="callout danger">
  <span class="callout-icon">✗</span>
  <div class="callout-content"><p><strong>UB is silent.</strong> A data race may "work" in debug builds or on x86 but corrupt data on ARM or after -O2 optimization. <em>Always</em> use proper synchronization — never rely on observed behavior from a racy program.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'race-example',
          language: 'cpp',
          caption: 'Classic data race — undefined behaviour',
          code: `#include <thread>

int counter = 0;  // Shared, unprotected

void increment() {
    for (int i = 0; i < 100000; ++i) {
        ++counter;  // DATA RACE: read-modify-write is not atomic
    }
}

// Running two threads on this is UB
// std::thread t1(increment);
// std::thread t2(increment);
// t1.join(); t2.join();
// counter may be 112'543 instead of 200'000 — or anything`
        }
      ]
    },

    {
      id: 'atomic',
      title: 'std::atomic — Lock-Free Operations',
      content: `
<p><code>std::atomic&lt;T&gt;</code> guarantees that operations on <code>T</code> are atomic — they appear instantaneous to other threads, with no intermediate states visible. For most types, this maps to a single CPU instruction (e.g., <code>LOCK XADD</code> on x86).</p>
<p>Common operations: <code>load()</code>, <code>store()</code>, <code>exchange()</code>, <code>fetch_add()</code>/<code>fetch_sub()</code>, <code>compare_exchange_weak()</code>/<code>strong()</code>.</p>
<p>The <strong>memory order</strong> parameter controls visibility guarantees across threads:</p>
<ul>
  <li><code>memory_order_relaxed</code> — No ordering, just atomicity. Use for counters where only the final value matters.</li>
  <li><code>memory_order_acquire/release</code> — The classic publish/subscribe pair. A release on thread A synchronizes with an acquire on thread B.</li>
  <li><code>memory_order_seq_cst</code> (default) — Sequentially consistent, strongest guarantee. Safe default, small extra cost on some architectures.</li>
</ul>`,
      codeBlocks: [
        {
          id: 'atomic-usage',
          language: 'cpp',
          caption: 'std::atomic: counter, flag, and CAS loop',
          code: `#include <atomic>
#include <thread>

// Thread-safe counter
std::atomic<int> counter{0};

void increment() {
    for (int i = 0; i < 100000; ++i) {
        counter.fetch_add(1, std::memory_order_relaxed);
        // Or: ++counter;  (seq_cst by default)
    }
}

// Thread-safe flag (stop signal)
std::atomic<bool> stop_flag{false};

void worker() {
    while (!stop_flag.load(std::memory_order_acquire)) {
        // Do work
    }
}

void controller() {
    // Do setup...
    stop_flag.store(true, std::memory_order_release);
}

// Compare-and-swap (CAS) — building block for lock-free structures
std::atomic<int> value{0};

void try_set_if_zero(int desired) {
    int expected = 0;
    // If value == expected, set to desired. Otherwise, update expected.
    bool swapped = value.compare_exchange_strong(
        expected, desired,
        std::memory_order_acq_rel,   // success order
        std::memory_order_acquire    // failure order
    );
}`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'load / store (relaxed)',          complexity: 'O(1)', notes: 'Single instruction on most ISAs' },
          { operation: 'fetch_add / fetch_sub',            complexity: 'O(1)', notes: 'Lock XADD on x86' },
          { operation: 'compare_exchange_strong',          complexity: 'O(1)', notes: 'CMPXCHG; may loop in contended case' },
          { operation: 'mutex lock (uncontended)',         complexity: 'O(1)', notes: 'Single atomic CAS' },
          { operation: 'mutex lock (contended)',           complexity: 'O(1) to O(n)', notes: 'OS scheduler involvement' },
        ]
      }
    },

    {
      id: 'mutex-lock-guard',
      title: 'std::mutex & RAII Lock Guards',
      content: `
<p>A <code>std::mutex</code> is a mutual exclusion primitive. Only one thread can <em>own</em> the mutex at a time; other threads block at <code>lock()</code> until the owner calls <code>unlock()</code>.</p>
<p>Never call <code>lock()</code> and <code>unlock()</code> manually — use RAII guards that automatically unlock when they go out of scope, even on exceptions:</p>
<ul>
  <li><code>std::lock_guard&lt;mutex&gt;</code> — Simple, non-movable lock for the lifetime of a scope.</li>
  <li><code>std::unique_lock&lt;mutex&gt;</code> — Movable, can lock/unlock manually, required for <code>condition_variable</code>.</li>
  <li><code>std::scoped_lock</code> (C++17) — Locks multiple mutexes simultaneously without deadlock.</li>
</ul>
<div class="callout tip">
  <span class="callout-icon">✓</span>
  <div class="callout-content"><p>Keep critical sections as short as possible. Lock only while you're accessing shared data. Heavy work (I/O, computation) should happen outside the lock.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'mutex-usage',
          language: 'cpp',
          caption: 'Mutex with lock_guard, unique_lock, and condition_variable',
          code: `#include <mutex>
#include <condition_variable>
#include <queue>

class ThreadSafeQueue {
public:
    void push(int val) {
        {
            std::lock_guard<std::mutex> lock(mtx_);
            queue_.push(val);
        }                        // lock released here (RAII)
        cv_.notify_one();        // Wake a waiting consumer
    }

    // Blocking pop — waits until queue has data
    int pop() {
        std::unique_lock<std::mutex> lock(mtx_);
        cv_.wait(lock, [this] { return !queue_.empty(); });
        // Re-acquired lock, queue is non-empty
        int val = queue_.front();
        queue_.pop();
        return val;
    }

    bool try_pop(int& out) {
        std::lock_guard<std::mutex> lock(mtx_);
        if (queue_.empty()) return false;
        out = queue_.front();
        queue_.pop();
        return true;
    }

private:
    std::queue<int>         queue_;
    std::mutex              mtx_;
    std::condition_variable cv_;
};`
        }
      ]
    },

    {
      id: 'deadlock',
      title: 'Deadlock & How to Prevent It',
      content: `
<p>A <strong>deadlock</strong> occurs when two or more threads each hold a resource the other needs:</p>
<ul>
  <li>Thread A holds mutex 1, waits for mutex 2</li>
  <li>Thread B holds mutex 2, waits for mutex 1</li>
  <li>Both block forever.</li>
</ul>
<p><strong>Deadlock prevention rules:</strong></p>
<ol>
  <li><strong>Lock ordering:</strong> Always acquire multiple mutexes in the same global order.</li>
  <li><strong>std::scoped_lock:</strong> Use C++17 <code>scoped_lock(mtx1, mtx2)</code> to lock multiple mutexes atomically — it uses deadlock avoidance internally.</li>
  <li><strong>Minimize lock scope:</strong> Don't call external code (callbacks, virtual functions) while holding a lock — they might try to acquire the same lock.</li>
  <li><strong>try_lock:</strong> If you can't guarantee ordering, use <code>try_lock</code> with backoff.</li>
</ol>
<div class="callout danger">
  <span class="callout-icon">✗</span>
  <div class="callout-content"><p><strong>Recursive locking:</strong> Locking a <code>std::mutex</code> you already own is UB (deadlock in practice). Use <code>std::recursive_mutex</code> if you genuinely need it (usually a design smell).</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'deadlock-prevention',
          language: 'cpp',
          caption: 'Deadlock prevention with scoped_lock',
          code: `std::mutex mtx_account_a;
std::mutex mtx_account_b;

// BAD — may deadlock
void transfer_bad(int amount) {
    std::lock_guard lk_a(mtx_account_a);  // Thread 1: locks A
    std::lock_guard lk_b(mtx_account_b);  // Thread 2 may hold B, deadlock!
}

// GOOD — C++17 scoped_lock locks both atomically
void transfer_good(int amount) {
    std::scoped_lock lock(mtx_account_a, mtx_account_b);
    // Both mutexes held — no deadlock possible
    // ... perform transfer ...
}

// GOOD — explicit ordering (lock A before B, always)
void transfer_ordered(int amount) {
    std::lock_guard lk_a(mtx_account_a);  // Always A first
    std::lock_guard lk_b(mtx_account_b);  // Then B
}

// std::shared_mutex for read-heavy workloads (C++17)
#include <shared_mutex>
std::shared_mutex rw_mtx;

void read_data() {
    std::shared_lock lock(rw_mtx);  // Multiple readers simultaneously
    // ...
}

void write_data() {
    std::unique_lock lock(rw_mtx);  // Exclusive write access
    // ...
}`
        }
      ]
    },

    {
      id: 'concurrency-guidelines',
      title: 'Concurrency Guidelines',
      content: `
<p>Quick reference for choosing the right synchronization primitive:</p>
<ul>
  <li><strong>Simple counter / flag</strong> → <code>std::atomic&lt;int/bool&gt;</code>. No lock overhead.</li>
  <li><strong>Protecting a data structure</strong> → <code>std::mutex</code> + <code>lock_guard</code>.</li>
  <li><strong>Producer-consumer signaling</strong> → <code>condition_variable</code> + <code>unique_lock</code>.</li>
  <li><strong>Read-heavy, write-rare</strong> → <code>std::shared_mutex</code> with <code>shared_lock</code> / <code>unique_lock</code>.</li>
  <li><strong>Multiple mutexes at once</strong> → <code>std::scoped_lock</code> (C++17).</li>
  <li><strong>One-time initialization</strong> → <code>std::once_flag</code> + <code>std::call_once</code>.</li>
</ul>
<div class="callout tip">
  <span class="callout-icon">✓</span>
  <div class="callout-content"><p><strong>Prefer message passing over shared state.</strong> Threads communicating via queues (like the <code>ThreadSafeQueue</code> above) are easier to reason about than shared data with locks. <code>std::async</code> and futures let you express concurrent operations as return values.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'call-once',
          language: 'cpp',
          caption: 'Thread-safe lazy initialization with call_once',
          code: `#include <mutex>

class Database {
public:
    static Database& instance() {
        std::call_once(init_flag_, []() {
            instance_ = new Database();
        });
        return *instance_;
    }
private:
    Database() { /* expensive init */ }
    static Database*   instance_;
    static std::once_flag init_flag_;
};

// Or simpler — static local (C++11: guaranteed thread-safe)
Database& db() {
    static Database instance;  // Initialized once, thread-safe since C++11
    return instance;
}`
        }
      ]
    }
  ]
};

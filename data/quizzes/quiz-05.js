var q5 = {
  chapterId: 5,
  passingScore: 70,
  questions: [
    {
      id: 'q5-1',
      text: 'What is a data race in C++?',
      options: [
        { id: 'a', text: 'Two threads reading the same variable simultaneously.' },
        { id: 'b', text: 'Two or more threads accessing the same memory, at least one writing, with no synchronization — producing undefined behaviour.', correct: true },
        { id: 'c', text: 'A competition between threads to acquire a mutex.' },
        { id: 'd', text: 'Accessing memory after it has been freed.' }
      ],
      explanation: 'A data race requires: concurrent access to the same memory location, at least one write, and no synchronization mechanism between the accesses. Data races produce undefined behaviour — not just wrong values but any possible outcome including crashes or silently incorrect results.'
    },
    {
      id: 'q5-2',
      text: 'What does std::atomic<int> counter ensure that plain int counter does not?',
      options: [
        { id: 'a', text: 'counter operations are faster than non-atomic operations.' },
        { id: 'b', text: 'Each operation on counter (load, store, fetch_add) is indivisible — no partial states visible to other threads.', correct: true },
        { id: 'c', text: 'counter is automatically initialized to zero.' },
        { id: 'd', text: 'counter is stored in a thread-local cache.' }
      ],
      explanation: 'std::atomic<int> guarantees each operation is atomic — it appears to happen instantaneously with no intermediate state visible to other threads. A plain int++ is typically three operations (read, add, write) that can interleave, causing lost updates.'
    },
    {
      id: 'q5-3',
      text: 'Why should you use std::lock_guard instead of manually calling mutex.lock() / mutex.unlock()?',
      options: [
        { id: 'a', text: 'lock_guard is faster than manual lock/unlock.' },
        { id: 'b', text: 'lock_guard automatically unlocks the mutex when it goes out of scope, including on exceptions (RAII).', correct: true },
        { id: 'c', text: 'lock_guard works with multiple mutexes simultaneously.' },
        { id: 'd', text: 'Manual lock/unlock is deprecated in C++17.' }
      ],
      explanation: 'RAII (Resource Acquisition Is Initialization): lock_guard acquires the mutex in its constructor and releases it in its destructor — guaranteed even if an exception is thrown. Manual lock/unlock risks a missing unlock (on exception paths or early returns), causing deadlock.'
    },
    {
      id: 'q5-4',
      text: 'What is a deadlock?',
      options: [
        { id: 'a', text: 'A crash caused by accessing freed memory in a multi-threaded program.' },
        { id: 'b', text: 'A situation where two or more threads each hold a resource the other needs — both block forever.', correct: true },
        { id: 'c', text: 'A data race that causes a thread to loop indefinitely.' },
        { id: 'd', text: 'An OS-level thread that has been killed but not joined.' }
      ],
      explanation: 'Classic deadlock: Thread A holds mutex 1, waits for mutex 2; Thread B holds mutex 2, waits for mutex 1. Neither can proceed. Prevention: always acquire multiple locks in a consistent global order, or use std::scoped_lock to acquire all locks atomically.'
    },
    {
      id: 'q5-5',
      text: 'When should you use std::unique_lock instead of std::lock_guard?',
      options: [
        { id: 'a', text: 'When you need to lock multiple mutexes.' },
        { id: 'b', text: 'When you need to use a condition_variable, or when you need to manually unlock/relock or defer locking.', correct: true },
        { id: 'c', text: 'unique_lock is always preferred — lock_guard is obsolete.' },
        { id: 'd', text: 'When the mutex must not be unlocked on exception.' }
      ],
      explanation: 'std::condition_variable::wait() requires std::unique_lock because it needs to unlock the mutex while waiting and relock it when notified. unique_lock is also needed for deferred locking, timed locking, or manual unlock/relock. For simple scopes, lock_guard is lighter.'
    },
    {
      id: 'q5-6',
      text: 'What does memory_order_relaxed guarantee?',
      options: [
        { id: 'a', text: 'Sequential consistency across all threads.' },
        { id: 'b', text: 'Atomicity of the operation only — no ordering guarantees relative to other operations.', correct: true },
        { id: 'c', text: 'The operation is visible to all threads immediately.' },
        { id: 'd', text: 'All preceding stores are visible before this load.' }
      ],
      explanation: 'memory_order_relaxed guarantees the operation itself is atomic (no torn reads/writes), but makes no guarantees about ordering relative to other memory operations. It\'s appropriate for counters where only the final accumulated value matters, not the order of specific increments.'
    },
    {
      id: 'q5-7',
      text: 'How does std::scoped_lock prevent deadlock when acquiring multiple mutexes?',
      options: [
        { id: 'a', text: 'It uses a fixed alphabetical ordering of mutex addresses.' },
        { id: 'b', text: 'It acquires all mutexes atomically using a deadlock-avoidance algorithm (like std::lock).', correct: true },
        { id: 'c', text: 'It acquires mutexes one by one with a timeout on each.' },
        { id: 'd', text: 'It detects deadlock and throws an exception.' }
      ],
      explanation: 'std::scoped_lock uses std::lock internally, which uses a deadlock-avoidance algorithm (e.g., try-and-back-off) to acquire all the locks without deadlock, regardless of the order threads try to acquire them. This is the recommended C++17 approach for holding multiple mutexes.'
    },
    {
      id: 'q5-8',
      text: 'For a single shared integer counter accessed by many threads, which is the most appropriate synchronization choice?',
      options: [
        { id: 'a', text: 'std::mutex protecting a plain int.' },
        { id: 'b', text: 'std::atomic<int> with fetch_add.', correct: true },
        { id: 'c', text: 'A condition_variable to coordinate increments.' },
        { id: 'd', text: 'std::shared_mutex with shared_lock.' }
      ],
      explanation: 'For a single integer counter, std::atomic<int> with fetch_add is ideal: it maps to a single atomic CPU instruction (LOCK XADD on x86), no lock overhead, no contention on the lock itself. Mutex-protecting a plain int works but has more overhead and can serialize threads unnecessarily.'
    },
    {
      id: 'q5-9',
      text: 'What is the recommended way to implement thread-safe lazy initialization of a singleton in C++11 and later?',
      options: [
        { id: 'a', text: 'Use a global std::mutex and double-checked locking.' },
        { id: 'b', text: 'Use a function-local static variable — C++11 guarantees thread-safe initialization.', correct: true },
        { id: 'c', text: 'Use std::once_flag + std::call_once only.' },
        { id: 'd', text: 'Use std::atomic<bool> to guard the initialization.' }
      ],
      explanation: 'Since C++11, initialization of a function-local static variable is guaranteed to happen exactly once and to be thread-safe — the compiler inserts synchronization. This is simpler and correct: T& instance() { static T obj; return obj; }. std::call_once is also valid but more verbose.'
    }
  ]
};

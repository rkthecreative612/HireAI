import { RoleQuestionPool } from '../types';

export const PRESET_QUESTION_POOLS: RoleQuestionPool[] = [
  {
    id: 'senior-frontend-react',
    roleName: 'Senior Frontend Developer',
    experienceLevel: 'Senior',
    createdAt: '2026-07-01T10:00:00Z',
    description: 'Specialized in React 19, TypeScript, modern CSS architectures, performance optimization, and web accessibility.',
    questions: [
      // BASIC (Easy, Medium, Hard)
      {
        id: 'fe-b-e-1',
        category: 'basic',
        difficulty: 'easy',
        questionText: 'Explain the difference between props and state in React, and when you should use each.',
        keyEvaluationCriteria: [
          'Props are read-only inputs passed from parent components',
          'State is managed internally within a component and triggers re-renders on update',
          'Identifies immutable vs mutable dynamic state concepts'
        ],
        sampleGoodAnswerSummary: 'Props are external inputs passed down to components (immutable by the receiver), while state is local mutable component data managed via hooks like useState.'
      },
      {
        id: 'fe-b-e-2',
        category: 'basic',
        difficulty: 'easy',
        questionText: 'What is the Event Loop in JavaScript, and how do macro-tasks differ from micro-tasks?',
        keyEvaluationCriteria: [
          'Call stack vs Callback queues',
          'Microtasks (Promises, queueMicrotask) run immediately after current script before next macro-task',
          'Macrotasks (setTimeout, setInterval, I/O) run in subsequent ticks'
        ]
      },
      {
        id: 'fe-b-m-1',
        category: 'basic',
        difficulty: 'medium',
        questionText: 'How does React Virtual DOM reconciliation work, and what role do `key` props play in list rendering efficiency?',
        keyEvaluationCriteria: [
          'Diffing algorithm comparing virtual trees',
          'Keys provide persistent identities across renders preventing unnecessary node teardown/recreation',
          'Warns against using array indices as keys for re-ordered dynamic lists'
        ]
      },
      {
        id: 'fe-b-m-2',
        category: 'basic',
        difficulty: 'medium',
        questionText: 'Compare `useCallback` vs `useMemo` in React. Under what specific conditions do they prevent unnecessary re-renders?',
        keyEvaluationCriteria: [
          'useCallback memoizes callback function references; useMemo memoizes computed values',
          'Only useful when passed to memoized children (React.memo) or as useEffect dependencies',
          'Acknowledges premature optimization cost'
        ]
      },
      {
        id: 'fe-b-h-1',
        category: 'basic',
        difficulty: 'hard',
        questionText: 'Deeply explain JavaScript closures, memory leaks caused by retained closure scopes, and how modern V8 engines optimize closure contexts.',
        keyEvaluationCriteria: [
          'Functions retain reference to outer lexical environment',
          'Accidental retaining of large objects or uncleaned DOM listeners via outer lexical references',
          'Context sharing and context splitting optimizations in V8'
        ]
      },
      // DOMAIN (Easy, Medium, Hard)
      {
        id: 'fe-d-e-1',
        category: 'domain',
        difficulty: 'easy',
        questionText: 'What are CSS Custom Properties (CSS Variables) and how do they differ from preprocessor variables like SASS $variables?',
        keyEvaluationCriteria: [
          'CSS Custom Properties operate dynamically in the browser runtime and cascade through DOM',
          'SASS variables are statically compiled at build time',
          'Can be modified via JavaScript at runtime'
        ]
      },
      {
        id: 'fe-d-m-1',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'Explain key metrics in Web Vitals (LCP, INP, CLS). What techniques would you apply to diagnose and fix a bad Interaction to Next Paint (INP)?',
        keyEvaluationCriteria: [
          'INP measures overall responsiveness to user interactions throughout page lifecycle',
          'Long tasks blocking main thread (JS execution, heavy renders)',
          'Yielding to main thread via requestIdleCallback, Web Workers, or breaking heavy tasks with setTimeout/scheduler.yield()'
        ]
      },
      {
        id: 'fe-d-m-2',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'How would you architect an accessible, keyboard-navigable Modal Dialog component from scratch without relying on external libraries?',
        keyEvaluationCriteria: [
          'Focus trapping inside the modal',
          'Proper ARIA attributes (role="dialog", aria-modal="true", aria-labelledby)',
          'Esc key listener and returning focus to trigger element upon closing'
        ]
      },
      {
        id: 'fe-d-h-1',
        category: 'domain',
        difficulty: 'hard',
        questionText: 'Describe how React 19 Concurrent Features (Transitions, Suspense, Server Components) shift rendering architecture compared to client-side SPAs.',
        keyEvaluationCriteria: [
          'Interruptible rendering and priority queues',
          'Server Components execute on server, reducing client bundle size and waterfalled client fetches',
          'useTransition and useActionState for non-blocking UI states'
        ]
      },
      {
        id: 'fe-d-h-2',
        category: 'domain',
        difficulty: 'hard',
        questionText: 'How do you design a robust Micro-Frontend architecture? Compare Module Federation, Iframe encapsulation, and Web Components.',
        keyEvaluationCriteria: [
          'Webpack/Rspack Module Federation for dynamic remote module loading and shared dependency singletons',
          'Web Components for framework-agnostic component boundaries',
          'Tradeoffs: css scoping, global state management, latency, routing'
        ]
      },
      // TRENDS (Easy, Medium, Hard)
      {
        id: 'fe-t-e-1',
        category: 'trends',
        difficulty: 'easy',
        questionText: 'What is the Tailwind CSS v4 engine engine overhaul, and how does `@import "tailwindcss";` change build workflows over legacy tailwind.config.js?',
        keyEvaluationCriteria: [
          'Rust-based Oxide engine for ultra-fast compilation',
          'CSS-first configuration using standard CSS directives instead of JS config files',
          'Improved browser compatibility and streamlined Vite integration'
        ]
      },
      {
        id: 'fe-t-m-1',
        category: 'trends',
        difficulty: 'medium',
        questionText: 'How do client-side WebAssembly (Wasm) modules enhance browser capabilities for resource-intensive web applications?',
        keyEvaluationCriteria: [
          'Near-native execution speed for C++/Rust/Go compiled binaries',
          'Use cases: audio/video processing, heavy image manipulation, AI model inference in browser',
          'Interoperability with JS memory and WebAssembly.instantiate'
        ]
      },
      {
        id: 'fe-t-h-1',
        category: 'trends',
        difficulty: 'hard',
        questionText: 'Analyze the impact of Browser AI APIs (e.g., Chrome Built-in AI / W3C Web AI) and client-side LLM execution vs Server-Side API proxies for web UX.',
        keyEvaluationCriteria: [
          'Zero network latency and offline functionality',
          'Privacy and zero API costs per token for local models',
          'Trade-offs: device memory limits, model size constraints, hardware capability fallback'
        ]
      },
      // SITUATIONAL (Easy, Medium, Hard)
      {
        id: 'fe-s-e-1',
        category: 'situational',
        difficulty: 'easy',
        questionText: 'A designer gives you a complex layout that looks great on desktop but overflows and breaks on mobile devices. How do you approach fixing it?',
        keyEvaluationCriteria: [
          'Mobile-first responsive design principles',
          'Using responsive flex/grid layouts and media queries',
          'Collaborating with product designer on adaptive content hierarchy rather than raw shrinking'
        ]
      },
      {
        id: 'fe-s-m-1',
        category: 'situational',
        difficulty: 'medium',
        questionText: 'Users report that an analytics web application becomes sluggish when rendering a dataset with 50,000 table rows. How would you systematically diagnose and resolve this?',
        keyEvaluationCriteria: [
          'Performance profiling with Chrome DevTools Performance & Memory tabs',
          'DOM virtualization/windowing (e.g. tanstack-virtual, react-window) to render only visible items',
          'Pagination, web workers for data processing, memoized row renderers'
        ]
      },
      {
        id: 'fe-s-m-2',
        category: 'situational',
        difficulty: 'medium',
        questionText: 'You inherit a legacy React codebase with deeply nested props drilling (10+ levels deep) and random state mutation bugs. What refactoring plan do you execute?',
        keyEvaluationCriteria: [
          'Incremental refactoring with tests',
          'Introducing Context API or atomic state management (Zustand/Jotai) for cross-cutting state',
          'Component composition patterns to avoid deep nesting'
        ]
      },
      {
        id: 'fe-s-h-1',
        category: 'situational',
        difficulty: 'hard',
        questionText: 'During a major feature launch, a critical third-party API dependency starts intermittently timing out for 30% of users. How do you implement resilience patterns on the frontend?',
        keyEvaluationCriteria: [
          'Optimistic UI updates with rollback strategy',
          'Exponential backoff retries with circuit breaker patterns',
          'Graceful degradation, fallback cached state, and clear non-blocking error messaging'
        ]
      },
      {
        id: 'fe-s-h-2',
        category: 'situational',
        difficulty: 'hard',
        questionText: 'Two junior developers on your team disagree on state management approach—one wants Redux Toolkit, the other wants local React state everywhere. How do you facilitate alignment?',
        keyEvaluationCriteria: [
          'Objective evaluation framework (complexity, team velocity, maintainability, bundle size)',
          'Distinguishing server state (TanStack Query) from global UI state and local component state',
          'Establishing clear architectural guidelines and documenting team consensus'
        ]
      }
    ]
  },
  {
    id: 'senior-backend-node',
    roleName: 'Senior Backend Engineer',
    experienceLevel: 'Senior',
    createdAt: '2026-07-02T12:00:00Z',
    description: 'Specialized in Node.js, distributed systems, SQL/NoSQL databases, RESTful & gRPC APIs, and microservice architecture.',
    questions: [
      {
        id: 'be-b-e-1',
        category: 'basic',
        difficulty: 'easy',
        questionText: 'What is non-blocking I/O in Node.js and how does libuv manage asynchronous operations under the hood?',
        keyEvaluationCriteria: [
          'Event-driven, single-threaded JavaScript execution context',
          'Libuv thread pool handling async I/O operations (file system, DNS, crypto)',
          'Non-blocking system calls'
        ]
      },
      {
        id: 'be-b-e-2',
        category: 'basic',
        difficulty: 'easy',
        questionText: 'Compare HTTP GET vs POST vs PUT vs PATCH requests in RESTful API design. When should each method be used?',
        keyEvaluationCriteria: [
          'GET for safe, idempotent data retrieval',
          'POST for creating resources (non-idempotent)',
          'PUT for complete resource replacement (idempotent)',
          'PATCH for partial resource modifications'
        ]
      },
      {
        id: 'be-b-m-1',
        category: 'basic',
        difficulty: 'medium',
        questionText: 'Explain ACID properties in relational databases and how transaction isolation levels (e.g. Read Committed vs Repeatable Read) prevent concurrency anomalies.',
        keyEvaluationCriteria: [
          'Atomicity, Consistency, Isolation, Durability',
          'Dirty reads, non-repeatable reads, phantom reads',
          'Locking mechanisms vs MVCC (Multi-Version Concurrency Control)'
        ]
      },
      {
        id: 'be-b-m-2',
        category: 'basic',
        difficulty: 'medium',
        questionText: 'How do index structures (B-Trees vs Hash Indexes) optimize database query performance, and what are the write-amplification trade-offs?',
        keyEvaluationCriteria: [
          'B-Trees supporting range queries and logarithmic search complexity',
          'Hash indexes providing O(1) exact match lookups',
          'Slower INSERT/UPDATE/DELETE operations due to index maintenance overhead'
        ]
      },
      {
        id: 'be-b-h-1',
        category: 'basic',
        difficulty: 'hard',
        questionText: 'Explain the CAP theorem and PACELC theorem. In a distributed network partition, how do CP and AP systems trade off consistency and availability?',
        keyEvaluationCriteria: [
          'Consistency vs Availability during Partitions',
          'PACELC extending CAP to normal operation (Latency vs Consistency)',
          'Real-world system examples (PostgreSQL vs DynamoDB vs Cassandra)'
        ]
      },
      {
        id: 'be-d-e-1',
        category: 'domain',
        difficulty: 'easy',
        questionText: 'How do you design database connection pooling (e.g. PgBouncer or generic poolers) to avoid exhausting backend connections during traffic bursts?',
        keyEvaluationCriteria: [
          'Reusing active connections instead of opening/closing TCP sockets per request',
          'Configuring min/max connection pool boundaries',
          'Handling connection timeout and pool exhaustion errors gracefully'
        ]
      },
      {
        id: 'be-d-m-1',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'How do you design a scalable rate limiter middleware for a high-traffic API endpoint handling 100,000 requests/sec?',
        keyEvaluationCriteria: [
          'Algorithms: Token Bucket, Leaky Bucket, Sliding Window Log / Counter',
          'Using Redis cluster for distributed atomic memory operations (INCR, EXPIRE, Lua scripts)',
          'HTTP headers return (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After)'
        ]
      },
      {
        id: 'be-d-m-2',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'What strategies do you use for secure token authentication (JWT vs session storage) and how do you handle refresh token rotation and revocation?',
        keyEvaluationCriteria: [
          'Short-lived access JWTs paired with long-lived secure HttpOnly refresh cookies',
          'Refresh token rotation preventing replay attacks',
          'Handling token revocation lists using fast Redis key lookups'
        ]
      },
      {
        id: 'be-d-m-3',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'Compare REST APIs vs gRPC vs GraphQL. Under what specific system requirements would you choose gRPC over REST?',
        keyEvaluationCriteria: [
          'gRPC utilizing HTTP/2 binary Protocol Buffers for fast microservice inter-comm',
          'REST providing widespread client compatibility and standard HTTP caching',
          'GraphQL allowing client-driven flexible schema querying'
        ]
      },
      {
        id: 'be-d-m-4',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'How do you handle background job processing and asynchronous message queues (e.g. BullMQ, Celery, RabbitMQ) in backend services?',
        keyEvaluationCriteria: [
          'Offloading heavy I/O or image/email tasks out of HTTP request/response cycle',
          'Retry strategies with exponential backoff and dead-letter queues (DLQ)',
          'Ensuring at-least-once message delivery and idempotency'
        ]
      },
      {
        id: 'be-d-h-1',
        category: 'domain',
        difficulty: 'hard',
        questionText: 'How would you architect an idempotent payment processing system that guarantees no double-charging even with network timeouts and duplicate retries?',
        keyEvaluationCriteria: [
          'Idempotency keys generated by client and stored in database transaction locks',
          'Database unique constraints and state machine transitions (Pending -> Processing -> Completed)',
          'Handling race conditions with optimistic locking or distributed locks (Redlock)'
        ]
      },
      {
        id: 'be-d-h-2',
        category: 'domain',
        difficulty: 'hard',
        questionText: 'How do you implement database sharding and read-replicas for a relational database growing beyond 10TB of operational data?',
        keyEvaluationCriteria: [
          'Selecting an appropriate shard key to avoid hot-spotting',
          'Handling cross-shard joins and distributed transactions (2PC / Saga pattern)',
          'Managing read-replica replication lag and eventual consistency windows'
        ]
      },
      {
        id: 'be-t-e-1',
        category: 'trends',
        difficulty: 'easy',
        questionText: 'What are Serverless compute models (e.g. AWS Lambda, Cloud Run, Vercel Functions), and how do cold starts affect backend latency?',
        keyEvaluationCriteria: [
          'Event-driven, ephemeral container execution scaling to zero',
          'Cold start initialization overhead (runtime boot + dependency loading)',
          'Mitigation strategies like provisioned concurrency and lightweight runtimes'
        ]
      },
      {
        id: 'be-t-m-1',
        category: 'trends',
        difficulty: 'medium',
        questionText: 'What are event-driven architectures with Apache Kafka or EventBridge, and how do event-sourcing and CQRS patterns improve system scalability?',
        keyEvaluationCriteria: [
          'Decoupling producer and consumer services via persistent append-only logs',
          'CQRS separating read and write data models for independent scaling',
          'Event sourcing storing state changes as immutable series of events'
        ]
      },
      {
        id: 'be-t-m-2',
        category: 'trends',
        difficulty: 'medium',
        questionText: 'How do OpenTelemetry, structured JSON logging, and distributed tracing (e.g., Jaeger/Zipkin) help observe microservice request propagation?',
        keyEvaluationCriteria: [
          'Correlation IDs / Trace IDs passed via HTTP/gRPC request headers',
          'Aggregating metrics, logs, and traces into centralized observability platforms',
          'Rapidly pinpointing microservice latency bottlenecks'
        ]
      },
      {
        id: 'be-t-h-1',
        category: 'trends',
        difficulty: 'hard',
        questionText: 'How do vector databases (e.g. Pgvector, Pinecone, Qdrant) work for RAG (Retrieval-Augmented Generation) applications in modern AI backends?',
        keyEvaluationCriteria: [
          'Storing high-dimensional text/image embeddings',
          'Nearest-neighbor similarity search (HNSW, Cosine, Euclidean distance algorithms)',
          'Hybrid search combining keyword BM25 indexing with semantic vector retrieval'
        ]
      },
      {
        id: 'be-s-e-1',
        category: 'situational',
        difficulty: 'easy',
        questionText: 'A third-party webhook notification service fails silently and stops delivering events to your backend. How do you detect and recover lost webhook payloads?',
        keyEvaluationCriteria: [
          'Monitoring missing webhook heartbeat metrics and alerting on drop-offs',
          'Providing a polling reconciliation batch job to sync missing records',
          'Logging raw incoming webhooks before async processing'
        ]
      },
      {
        id: 'be-s-m-1',
        category: 'situational',
        difficulty: 'medium',
        questionText: 'During a flash sale, thousands of users add the exact same item to their cart simultaneously, causing inventory numbers to drop below zero. How do you prevent stock overselling?',
        keyEvaluationCriteria: [
          'Atomic database update queries (UPDATE items SET stock = stock - 1 WHERE id = ? AND stock > 0)',
          'Pessimistic locking (SELECT FOR UPDATE) or optimistic locking with version numbers',
          'Using Redis atomic DECR operations for high-speed reservation holds'
        ]
      },
      {
        id: 'be-s-m-2',
        category: 'situational',
        difficulty: 'medium',
        questionText: 'A memory leak causes backend Node.js workers to crash out-of-memory every 4 hours under high load. How do you profile and eliminate memory leaks?',
        keyEvaluationCriteria: [
          'Generating heap snapshots using Node.js `--inspect` and Chrome DevTools',
          'Inspecting detached DOM elements, uncollected global event listeners, or growing array caches',
          'Monitoring heap usage trends in production metrics'
        ]
      },
      {
        id: 'be-s-h-1',
        category: 'situational',
        difficulty: 'hard',
        questionText: 'A database query that usually takes 15ms suddenly spikes to 8000ms during peak load, causing API connection pool exhaustion. How do you triage and fix this live incident?',
        keyEvaluationCriteria: [
          'Analyzing slow query logs, EXPLAIN ANALYZE execution plans, missing database indexes',
          'Implementing query timeouts, circuit breakers, and connection pool sizing limits',
          'Adding Redis caching layer, read-replicas, or query optimization'
        ]
      }
    ]
  },
  {
    id: 'devops-cloud-lead',
    roleName: 'DevOps & Cloud Engineer',
    experienceLevel: 'Lead',
    createdAt: '2026-07-03T14:00:00Z',
    description: 'Specialized in Kubernetes, Terraform, CI/CD pipelines, Cloud Native Security, and Observability.',
    questions: [
      {
        id: 'do-b-e-1',
        category: 'basic',
        difficulty: 'easy',
        questionText: 'What is Infrastructure as Code (IaC) and what advantages does Terraform offer over manual cloud console configurations?',
        keyEvaluationCriteria: [
          'Version-controlled, reproducible infrastructure states',
          'Declarative syntax vs imperative commands',
          'Terraform state management and plan dry-runs'
        ]
      },
      {
        id: 'do-b-e-2',
        category: 'basic',
        difficulty: 'easy',
        questionText: 'Explain the difference between Docker containers and traditional Virtual Machines (VMs) in terms of OS kernel sharing and resource overhead.',
        keyEvaluationCriteria: [
          'Containers share the host OS kernel; VMs emulate complete guest hardware and OS',
          'Faster startup times and lower memory footprint for containers',
          'Isolation boundaries: process namespaces & cgroups vs hypervisor'
        ]
      },
      {
        id: 'do-b-m-1',
        category: 'basic',
        difficulty: 'medium',
        questionText: 'Explain Linux cgroups and namespaces. How do they enforce CPU/memory resource limits and process isolation for containerized runtimes?',
        keyEvaluationCriteria: [
          'Namespaces providing isolation (PID, NET, MNT, IPC, UTS, USER)',
          'Cgroups restricting resource consumption caps (CPU, Memory, Disk I/O)',
          'How container runtimes (containerd/CRI-O) interact with the kernel'
        ]
      },
      {
        id: 'do-b-m-2',
        category: 'basic',
        difficulty: 'medium',
        questionText: 'What are the core components of the Kubernetes Control Plane (kube-apiserver, etcd, kube-scheduler, kube-controller-manager)?',
        keyEvaluationCriteria: [
          'kube-apiserver acting as central REST entrypoint',
          'etcd holding persistent cluster state',
          'kube-scheduler placing pods onto nodes based on resource constraints',
          'kube-controller-manager enforcing desired cluster state loops'
        ]
      },
      {
        id: 'do-b-h-1',
        category: 'basic',
        difficulty: 'hard',
        questionText: 'How does BGP (Border Gateway Protocol) routing and CNI plugins (e.g. Cilium, Calico) handle high-performance pod-to-pod networking in multi-node clusters?',
        keyEvaluationCriteria: [
          'eBPF kernel probes in Cilium replacing iptables routing tables',
          'Overlay networks (VXLAN/Geneve) vs direct BGP node routing',
          'Network performance, latency reduction, and observability benefits'
        ]
      },
      {
        id: 'do-d-e-1',
        category: 'domain',
        difficulty: 'easy',
        questionText: 'How do you structure GitHub Actions or GitLab CI pipelines for automated linting, security scanning, building container images, and deploying to staging?',
        keyEvaluationCriteria: [
          'Modular pipeline stages with dependency caching',
          'Automated container building, tagging with git SHA, and pushing to container registries',
          'Environment secret management and deployment triggers'
        ]
      },
      {
        id: 'do-d-m-1',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'Explain Kubernetes Pod networking, Service abstraction (ClusterIP vs NodePort vs LoadBalancer), and Ingress Controllers.',
        keyEvaluationCriteria: [
          'IP-per-pod network model',
          'Services as stable entrypoints balancing traffic across dynamic Pod endpoints',
          'Ingress Controllers routing HTTP/HTTPS traffic based on path/host rules'
        ]
      },
      {
        id: 'do-d-m-2',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'How do you set up GitOps workflows using ArgoCD or Flux to keep Kubernetes cluster state automatically synchronized with Git repositories?',
        keyEvaluationCriteria: [
          'Git as single source of truth for declarative manifests (Helm/Kustomize)',
          'Continuous reconciliation loop detecting and correcting drift',
          'Rollback capabilities via Git commit reverts'
        ]
      },
      {
        id: 'do-d-m-3',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'How do you configure Kubernetes Horizontal Pod Autoscaler (HPA) and Cluster Autoscaler / Karpenter for dynamic load scaling?',
        keyEvaluationCriteria: [
          'HPA scaling pod replicas based on CPU/Memory or custom Prometheus metrics',
          'Cluster Autoscaler / Karpenter provisioning extra worker node instances when pods are unschedulable',
          'Preventing thrashing with scale-down stabilization windows'
        ]
      },
      {
        id: 'do-d-m-4',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'How do you manage Terraform remote state locks (S3 + DynamoDB or GCS) and prevent concurrent state corruption across engineering teams?',
        keyEvaluationCriteria: [
          'Remote backend storage holding central tfstate',
          'Distributed state locking preventing race conditions during `terraform apply`',
          'State encryption at rest and sensitive output masking'
        ]
      },
      {
        id: 'do-d-h-1',
        category: 'domain',
        difficulty: 'hard',
        questionText: 'How do you design a zero-downtime deployment strategy (Blue/Green or Canary) in Kubernetes using ArgoCD or Flagger?',
        keyEvaluationCriteria: [
          'Automated metric analysis (Prometheus error rates / latency thresholds)',
          'Traffic splitting via service meshes (Istio/Linkerd) or ingress rules',
          'Automatic rollback on metric anomaly detection'
        ]
      },
      {
        id: 'do-d-h-2',
        category: 'domain',
        difficulty: 'hard',
        questionText: 'How do you architect a Disaster Recovery (DR) plan across multiple cloud regions with active-active database replication and automated DNS failover (Route53/Cloudflare)?',
        keyEvaluationCriteria: [
          'RTO (Recovery Time Objective) and RPO (Recovery Point Objective) definitions',
          'Cross-region database replication (synchronous vs asynchronous)',
          'Global traffic management health checks and automated DNS routing updates'
        ]
      },
      {
        id: 'do-t-e-1',
        category: 'trends',
        difficulty: 'easy',
        questionText: 'What is FinOps in cloud engineering, and what strategies do you use to reduce AWS/GCP cloud bills (Reserved Instances, Savings Plans, Spot Nodes)?',
        keyEvaluationCriteria: [
          'Continuous cost visibility and allocation tagging',
          'Utilizing Spot/Preemptible instances for fault-tolerant workloads',
          'Right-sizing compute instances and cleaning unattached EBS volumes'
        ]
      },
      {
        id: 'do-t-m-1',
        category: 'trends',
        difficulty: 'medium',
        questionText: 'What is eBPF (Extended Berkeley Packet Filter), and how is it transforming cloud-native observability, networking, and security tooling (Cilium, Falco)?',
        keyEvaluationCriteria: [
          'Executing sandboxed code inside the Linux kernel without changing kernel source or loading modules',
          'Zero-overhead observability capturing system calls and network packets',
          'Real-time kernel security event detection'
        ]
      },
      {
        id: 'do-t-m-2',
        category: 'trends',
        difficulty: 'medium',
        questionText: 'How are Platform Engineering teams using Internal Developer Platforms (IDPs) (e.g. Backstage, Kratix) to reduce developer cognitive load?',
        keyEvaluationCriteria: [
          'Self-service portals providing automated infrastructure bootstrapping templates',
          'Enforcing security standards without manual ops ticket blocking',
          'Centralizing API documentation and service catalogs'
        ]
      },
      {
        id: 'do-t-h-1',
        category: 'trends',
        difficulty: 'hard',
        questionText: 'How do you implement SLI/SLO/SLA frameworks and Error Budget policies to balance feature release velocity with system reliability?',
        keyEvaluationCriteria: [
          'Defining Service Level Indicators (latency, error rate) and Service Level Objectives (99.9%)',
          'Calculating Error Budgets and halting risky deployments when budgets are exhausted',
          'Automating incident response workflows'
        ]
      },
      {
        id: 'do-s-e-1',
        category: 'situational',
        difficulty: 'easy',
        questionText: 'A Kubernetes worker node goes into `NotReady` state due to disk pressure. How do you drain the node and safely reschedule pods?',
        keyEvaluationCriteria: [
          'Using `kubectl cordon` and `kubectl drain` to gracefully evict pods',
          'Respecting PodDisruptionBudgets (PDB) during eviction',
          'Investigating container log volume build-up or ephemeral storage issues'
        ]
      },
      {
        id: 'do-s-m-1',
        category: 'situational',
        difficulty: 'medium',
        questionText: 'An SSL/TLS certificate for a production ingress endpoint expires in 10 minutes due to cert-manager renewal failure. How do you triage and fix it immediately?',
        keyEvaluationCriteria: [
          'Inspecting cert-manager controller logs and Let\'s Encrypt HTTP-01 / DNS-01 challenge failures',
          'Manually renewing or injecting updated TLS secret keys as emergency patch',
          'Adding monitoring alerts for certificate expiration windows'
        ]
      },
      {
        id: 'do-s-m-2',
        category: 'situational',
        difficulty: 'medium',
        questionText: 'A developer accidentally commits an AWS IAM secret access key to a public GitHub repository. What emergency steps do you immediately execute?',
        keyEvaluationCriteria: [
          'Immediately revoking and deleting the AWS access key in IAM',
          'Reviewing AWS CloudTrail logs for unauthorized API activity during key exposure window',
          'Rewriting git history or using Trufflehog/GitGuardian automated secret scanners in CI'
        ]
      },
      {
        id: 'do-s-h-1',
        category: 'situational',
        difficulty: 'hard',
        questionText: 'An attacker gains access to a compromised worker node in your cloud cluster. What security isolation policies prevent them from accessing database secrets and pivoting to other services?',
        keyEvaluationCriteria: [
          'Least privilege IAM roles for service accounts (IRSA / Workload Identity)',
          'NetworkPolicies restricting pod-to-pod egress/ingress traffic',
          'Seccomp/AppArmor profiles, non-root container runtimes, and external secret managers (Vault)'
        ]
      }
    ]
  },
  {
    id: 'test-qa-automation-engineer',
    roleName: 'QA & Software Test Automation Engineer (Test Role)',
    experienceLevel: 'Mid-Senior',
    createdAt: '2026-07-04T09:00:00Z',
    description: 'Specialized in Software Testing, Equivalence Partitioning, Boundary Value Analysis, Playwright/Cypress automation, and API test validation.',
    questions: [
      {
        id: 'qa-b-e-1',
        category: 'basic',
        difficulty: 'easy',
        questionText: 'Explain Equivalence Partitioning and Boundary Value Analysis test design techniques. How do they complement each other?',
        keyEvaluationCriteria: [
          'Equivalence partitioning divides input data into valid and invalid partitions',
          'Boundary Value Analysis tests extreme boundaries (min, max, min-1, max+1) of those partitions',
          'Identifies that bugs most frequently occur at boundary edges'
        ],
        sampleGoodAnswerSummary: 'Equivalence partitioning divides inputs into groups treated identically by the system. Boundary value analysis tests the edges of those partitions where bugs commonly hide.'
      },
      {
        id: 'qa-b-e-2',
        category: 'basic',
        difficulty: 'easy',
        questionText: 'What is the difference between Regression Testing and Smoke Testing, and when should each be executed in a CI/CD pipeline?',
        keyEvaluationCriteria: [
          'Smoke testing verifies critical path build stability before deeper tests run',
          'Regression testing verifies existing functionality remains unbroken after code changes',
          'Smoke runs immediately on deployment; regression runs on build triggers or nightly'
        ]
      },
      {
        id: 'qa-b-m-1',
        category: 'basic',
        difficulty: 'medium',
        questionText: 'Explain the Test Pyramid concept (Unit -> Integration -> End-to-End). Why is over-relying on E2E tests considered an anti-pattern?',
        keyEvaluationCriteria: [
          'Unit tests at base (fast, cheap), Integration in middle, E2E at top (slow, brittle, expensive)',
          'E2E tests are prone to flakiness, high maintenance, and long runtime feedback loops',
          'Advocates for balanced pyramid distribution'
        ]
      },
      {
        id: 'qa-b-m-2',
        category: 'basic',
        difficulty: 'medium',
        questionText: 'What is the difference between Black-Box, White-Box, and Grey-Box testing methodologies?',
        keyEvaluationCriteria: [
          'Black-box tests specifications without internal code visibility',
          'White-box tests internal code structures, logic branches, and statements',
          'Grey-box combines specification testing with internal database or architectural knowledge'
        ]
      },
      {
        id: 'qa-b-h-1',
        category: 'basic',
        difficulty: 'hard',
        questionText: 'Explain Mutation Testing (e.g. Stryker/Pitest). How does it evaluate test suite quality better than standard line coverage metrics?',
        keyEvaluationCriteria: [
          'Injects artificial bugs (mutants) into production code to verify if tests fail',
          'High line coverage does not equal high assertion quality',
          'Measures mutation score (killed mutants vs survived mutants)'
        ]
      },
      {
        id: 'qa-d-e-1',
        category: 'domain',
        difficulty: 'easy',
        questionText: 'How do you perform API testing for a RESTful service using POSTMAN, Supertest, or HTTP clients? What status codes indicate success vs client errors?',
        keyEvaluationCriteria: [
          'Validates HTTP status codes (200/201 vs 400/401/403/404)',
          'Checks JSON response schemas, headers, and payload attributes',
          'Validates error handling for invalid payloads'
        ]
      },
      {
        id: 'qa-d-m-1',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'Compare Playwright vs Cypress for Web E2E automation. How do auto-waiting, browser contexts, and shadow DOM handling compare?',
        keyEvaluationCriteria: [
          'Playwright supports multi-tab/multi-origin browser contexts and native WebSockets in parallel',
          'Cypress runs inside the browser event loop with chained assertion syntax',
          'Auto-waiting mechanisms eliminating flaky hardcoded sleeps'
        ]
      },
      {
        id: 'qa-d-m-2',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'How do you design a Page Object Model (POM) pattern in TypeScript for UI test suites? What are its maintainability benefits?',
        keyEvaluationCriteria: [
          'Separates page selectors/actions from actual test assertions',
          'Reduces duplicate code when UI selectors or flows change',
          'Provides clean domain-driven test readability'
        ]
      },
      {
        id: 'qa-d-m-3',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'What techniques do you use to eliminate test flakiness in asynchronous web applications with dynamic animations and network latency?',
        keyEvaluationCriteria: [
          'Avoiding fixed thread sleep statements (e.g., page.waitForTimeout)',
          'Using explicit web assertions and network response interception/waiting',
          'Isolating test state and seeding clean database states per test run'
        ]
      },
      {
        id: 'qa-d-m-4',
        category: 'domain',
        difficulty: 'medium',
        questionText: 'Explain how you mock third-party dependencies and external microservices using tools like MSW (Mock Service Worker) or WireMock.',
        keyEvaluationCriteria: [
          'Intercepts HTTP requests at network level without modifying application code',
          'Simulates edge-case responses (slow network, 500 server errors, malformed JSON)',
          'Allows deterministic test execution without hitting live third-party APIs'
        ]
      },
      {
        id: 'qa-d-h-1',
        category: 'domain',
        difficulty: 'hard',
        questionText: 'How do you design a contract testing suite using Pact between microservices to ensure backwards compatibility without spinning up full environments?',
        keyEvaluationCriteria: [
          'Consumer-driven contract definitions (Pact files)',
          'Provider verification against contract definitions in CI',
          'Detects breaking schema changes prior to staging deployments'
        ]
      },
      {
        id: 'qa-d-h-2',
        category: 'domain',
        difficulty: 'hard',
        questionText: 'How do you execute high-concurrency load and stress testing using k6 or Locust? What key metrics (p95, p99 latency, error rates, throughput) reveal performance bottlenecks?',
        keyEvaluationCriteria: [
          'Gradual virtual user (VU) ramping scripts',
          'p95/p99 latency thresholds vs average latency',
          'Identifying connection pool limits, database locks, or CPU throttling under load'
        ]
      },
      {
        id: 'qa-t-e-1',
        category: 'trends',
        difficulty: 'easy',
        questionText: 'What is Visual Regression Testing (e.g. Percy, Applitools, Playwright visual comparison)? How does it detect unexpected UI layout shifts?',
        keyEvaluationCriteria: [
          'Captures DOM pixel snapshots across viewport sizes',
          'Compares diffs against baseline approved images',
          'Ignores dynamic content via masking options'
        ]
      },
      {
        id: 'qa-t-m-1',
        category: 'trends',
        difficulty: 'medium',
        questionText: 'How is AI being used in modern test automation (e.g. self-healing locators, synthetic test data generation, exploratory testing agents)?',
        keyEvaluationCriteria: [
          'Self-healing locators dynamically adapting when CSS classes/IDs change',
          'LLM-assisted edge case and test scenario generation',
          'Synthetic seed data creation meeting complex business constraints'
        ]
      },
      {
        id: 'qa-t-m-2',
        category: 'trends',
        difficulty: 'medium',
        questionText: 'Explain Shift-Left and Shift-Right testing paradigms. How does testing in production (synthetic monitoring, feature flags, canary analysis) fit in?',
        keyEvaluationCriteria: [
          'Shift-left involves testing early in sprint design and PR stages',
          'Shift-right tests in production using observability telemetry, feature flags, and chaos testing',
          'Combines early prevention with real-world validation'
        ]
      },
      {
        id: 'qa-t-h-1',
        category: 'trends',
        difficulty: 'hard',
        questionText: 'How do you integrate automated security vulnerability testing (DAST/SAST) into automated QA CI/CD pipelines?',
        keyEvaluationCriteria: [
          'SAST static code analysis (e.g., SonarQube, Snyk) on pull requests',
          'DAST dynamic scanning (e.g., OWASP ZAP) against staging environments',
          'Automated dependency vulnerability audits blocking deployments on Critical CVEs'
        ]
      },
      {
        id: 'qa-s-e-1',
        category: 'situational',
        difficulty: 'easy',
        questionText: 'A developer marks a bug as "Cannot Reproduce", but a customer reports it consistently in production. How do you investigate and resolve this?',
        keyEvaluationCriteria: [
          'Gather precise environment specs (browser, device, OS version, network conditions)',
          'Examine client logs, network HAR files, and error tracking telemetry (Sentry)',
          'Attempt exact step replication and communicate findings constructively with developer'
        ]
      },
      {
        id: 'qa-s-m-1',
        category: 'situational',
        difficulty: 'medium',
        questionText: 'A release deployment deadline is in 2 hours, and 3 non-critical automated test cases are failing. How do you evaluate release risk and proceed?',
        keyEvaluationCriteria: [
          'Perform triage to assess impact and root cause of the 3 failures',
          'Determine if failure is flakiness, environment setup issue, or real regression',
          'Make informed recommendation (hotfix, bypass behind feature flag, or block release if risk is high)'
        ]
      },
      {
        id: 'qa-s-m-2',
        category: 'situational',
        difficulty: 'medium',
        questionText: 'You inherit a legacy test suite that takes 3 hours to run and fails 20% of the time due to flakiness. How do you refactor and modernize it?',
        keyEvaluationCriteria: [
          'Quarantine flaky tests out of main PR blocking gate',
          'Parallelize test execution using worker threads/sharding',
          'Replace brittle UI sleep waits with network mocks and atomic state setup'
        ]
      },
      {
        id: 'qa-s-h-1',
        category: 'situational',
        difficulty: 'hard',
        questionText: 'During a major production outage, tests passed 100% green in staging, but a database schema migration broke production checkout API. How do you conduct a post-mortem and prevent this?',
        keyEvaluationCriteria: [
          'Conducting blameless post-mortem analyzing disparity between staging and production data/schema states',
          'Adding automated schema migration dry-runs and backward compatibility contract tests',
          'Implementing automated smoke checks in production canary phases'
        ]
      }
    ]
  }
];

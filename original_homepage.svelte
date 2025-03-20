<!-- TimeTablePro Homepage -->
<script lang="ts">
  import { ArrowRight, Calendar, Users, School, Bell, BarChart, CheckCircle, Shield, Clock, Zap } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Avatar } from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { USER_ROLES } from '$lib/config';

  // UI testing mode - no redirection
  onMount(() => {
    console.log('UI Testing Mode - No Redirection');
  });

  // Feature cards
  const features = [
    {
      icon: Calendar,
      title: 'Intelligent Scheduling',
      description: 'AI-powered conflict resolution automatically optimizes timetables for efficiency.'
    },
    {
      icon: Users,
      title: 'Resource Management',
      description: 'Streamline allocation of teachers, rooms, and resources with smart assignments.'
    },
    {
      icon: Bell,
      title: 'Real-Time Updates',
      description: 'Instant notifications keep everyone informed about schedule changes.'
    },
    {
      icon: BarChart,
      title: 'Detailed Analytics',
      description: 'Data-driven insights to optimize resource utilization and scheduling patterns.'
    }
  ];

  // Role-specific features
  const roles = [
    {
      icon: School,
      role: 'Administrators',
      description: 'Comprehensive dashboard to manage schedules, resolve conflicts, and oversee all resources with powerful analytics.',
      features: ['Conflict resolution', 'Resource optimization', 'Batch scheduling']
    },
    {
      icon: Users,
      role: 'Teachers',
      description: 'Simple interface to view teaching schedules, set availability preferences, and receive timely notifications.',
      features: ['Availability management', 'Schedule exports', 'Class notifications']
    },
    {
      icon: Calendar,
      role: 'Students',
      description: 'Mobile-friendly access to class schedules with real-time updates and personalized views.',
      features: ['Mobile access', 'Real-time updates', 'Weekly/monthly views']
    }
  ];

  // Testimonials with more diverse roles and institutions
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'School Principal',
      institution: 'Lincoln High School',
      avatar: '👩‍🏫',
      quote: 'TimeTablePro transformed our scheduling process. We reduced planning time by 70% and eliminated double-bookings completely!'
    },
    {
      name: 'Michael Chen',
      role: 'Department Head',
      institution: 'State University',
      avatar: '👨‍🏫',
      quote: 'With 200+ faculty members, scheduling was a nightmare before TimeTablePro. The conflict resolution alone saves us weeks of work each semester.'
    },
    {
      name: 'Emily Brown',
      role: 'IT Director',
      institution: 'Westfield College',
      avatar: '👩‍💻',
      quote: 'Integration was seamless and the support team was exceptional. Our teachers adopted the system within days, not weeks.'
    }
  ];

  // Statistics
  const stats = [
    { value: '95%', label: 'Reduction in scheduling conflicts' },
    { value: '75%', label: 'Less time spent on administrative tasks' },
    { value: '10k+', label: 'Educational institutions worldwide' },
    { value: '99.9%', label: 'System uptime' }
  ];
</script>

<div class="flex flex-col min-h-screen bg-gradient-to-b from-primary-50 to-white">
  <!-- Navigation for Homepage -->
  <header class="fixed top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm">
    <nav class="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="text-2xl font-bold text-primary">TimeTablePro</a>
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-secondary-600 hover:text-primary transition-colors">Features</a>
        <a href="#solutions" class="text-secondary-600 hover:text-primary transition-colors">Solutions</a>
        <a href="#testimonials" class="text-secondary-600 hover:text-primary transition-colors">Testimonials</a>
      </div>
      <div class="flex items-center gap-4">
        <a href="/login" class="text-secondary-600 hover:text-primary">Login</a>
        <a href="/register" class="px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-600">
          Register
        </a>
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <main class="flex-1 pt-16">
    <!-- Hero Section -->
    <section class="w-full py-20 md:py-32 overflow-hidden">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
          <div class="space-y-8">
            <Badge variant="secondary" class="mb-2">Education's #1 Scheduling Solution</Badge>
            <h1 class="text-4xl font-bold leading-tight font-display md:text-5xl lg:text-6xl text-secondary-950">
              Intelligent <span class="text-primary-600">Timetable</span> Management
            </h1>
            <p class="text-lg md:text-xl text-secondary-600">
              Eliminate scheduling conflicts and optimize resource allocation with our AI-powered timetabling system designed specifically for educational institutions.
            </p>
            <div class="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" class="font-medium text-white transition-colors bg-primary-600 hover:bg-primary-700">
                Get Started <ArrowRight class="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" class="font-medium transition-colors border-2 border-primary-600 text-primary-600 hover:bg-primary-50">
                Watch Demo <Calendar class="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div class="flex flex-wrap items-center gap-4 pt-4 text-sm text-secondary-500">
              <div class="flex items-center">
                <CheckCircle class="w-4 h-4 mr-1 text-primary-600" />
                <span>No credit card required</span>
              </div>
              <div class="flex items-center">
                <CheckCircle class="w-4 h-4 mr-1 text-primary-600" />
                <span>Free 30-day trial</span>
              </div>
              <div class="flex items-center">
                <Shield class="w-4 h-4 mr-1 text-primary-600" />
                <span>GDPR compliant</span>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="absolute rounded-full -inset-4 bg-gradient-to-r from-primary-200/30 to-accent-200/30 blur-3xl"></div>
            <img
              src="/hero-illustration.svg"
              alt="TimeTablePro Dashboard Preview"
              class="relative w-full h-auto max-w-[600px] mx-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="w-full py-16 bg-gradient-to-r from-primary-900 to-primary-800">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
          {#each stats as stat}
            <div class="text-center">
              <p class="text-3xl font-bold text-white md:text-4xl">{stat.value}</p>
              <p class="mt-2 text-sm text-primary-100 md:text-base">{stat.label}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="w-full py-20 bg-white">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="mb-16 text-center">
          <Badge variant="outline" class="mb-4">Features</Badge>
          <h2 class="mb-4 text-3xl font-bold font-display md:text-4xl text-secondary-950">
            Scheduling made simple and powerful
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-secondary-600">
            Our comprehensive platform streamlines every aspect of educational timetabling with advanced automation.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {#each features as feature}
            <Card class="p-6 transition-all duration-300 border hover:shadow-xl hover:border-primary-200 border-secondary-100 h-full">
              <div class="flex items-center justify-center w-12 h-12 p-3 mb-4 rounded-lg bg-primary-100">
                <svelte:component this={feature.icon} class="w-6 h-6 text-primary-600" />
              </div>
              <h3 class="mb-2 text-xl font-semibold font-display text-secondary-900">
                {feature.title}
              </h3>
              <p class="text-secondary-600">
                {feature.description}
              </p>
            </Card>
          {/each}
        </div>
      </div>
    </section>

    <!-- User Roles Section -->
    <section id="solutions" class="w-full py-20 bg-secondary-50">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="mb-16 text-center">
          <Badge variant="outline" class="mb-4">Role-Based Solutions</Badge>
          <h2 class="mb-4 text-3xl font-bold font-display md:text-4xl text-secondary-950">
            Tailored for every stakeholder
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-secondary-600">
            Purpose-built interfaces and functionality for administrators, teachers, and students.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          {#each roles as role}
            <Card class="p-8 transition-all duration-300 border hover:shadow-xl hover:border-primary-200 border-secondary-100">
              <div class="flex items-center justify-center w-12 h-12 p-3 mb-4 rounded-full bg-accent-100">
                <svelte:component this={role.icon} class="w-6 h-6 text-accent-600" />
              </div>
              <h3 class="mb-2 text-xl font-semibold font-display text-secondary-900">
                {role.role}
              </h3>
              <p class="mb-4 text-secondary-600">
                {role.description}
              </p>
              <ul class="mb-6 space-y-2">
                {#each role.features as feature}
                  <li class="flex items-start">
                    <CheckCircle class="w-5 h-5 mr-2 text-primary-600 shrink-0 mt-0.5" />
                    <span class="text-secondary-700">{feature}</span>
                  </li>
                {/each}
              </ul>
              <Button variant="outline" class="w-full border-secondary-200 hover:bg-secondary-50">
                Learn More <ArrowRight class="w-4 h-4 ml-2" />
              </Button>
            </Card>
          {/each}
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="w-full py-20 bg-white">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="mb-16 text-center">
          <Badge variant="outline" class="mb-4">Process</Badge>
          <h2 class="mb-4 text-3xl font-bold font-display md:text-4xl text-secondary-950">
            How TimeTablePro works
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-secondary-600">
            Our streamlined process ensures smooth implementation and immediate benefits.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-3">
          {#each [
            {
              step: '01',
              title: 'Set Up Resources',
              description: 'Easily input your teachers, rooms, and classes with our intuitive interface.',
              icon: Users
            },
            {
              step: '02',
              title: 'Define Constraints',
              description: 'Set scheduling rules, teacher availability, and room requirements.',
              icon: Clock
            },
            {
              step: '03',
              title: 'Generate & Optimize',
              description: 'Our AI generates conflict-free timetables optimized for your specific needs.',
              icon: Zap
            }
          ] as step, i}
            <div class="relative">
              <div class="flex flex-col items-center text-center md:items-start md:text-left">
                <div class="flex items-center justify-center w-16 h-16 mb-6 text-lg font-bold text-white rounded-full bg-primary-600">
                  {step.step}
                </div>
                <h3 class="mb-3 text-xl font-semibold font-display text-secondary-900">{step.title}</h3>
                <p class="text-secondary-600">{step.description}</p>
              </div>
              {#if i < 2}
                <div class="hidden md:block absolute top-8 -right-6 w-12 h-0.5 bg-primary-200"></div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="w-full py-20 bg-white">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="p-12 overflow-hidden text-center bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl md:p-20 relative">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          <h2 class="mb-6 text-3xl font-bold text-white font-display md:text-4xl relative z-10">
            Ready to transform your scheduling process?
          </h2>
          <p class="max-w-2xl mx-auto mb-8 text-lg text-primary-100 relative z-10">
            Join thousands of educational institutions worldwide that trust TimeTablePro to save time and eliminate scheduling headaches.
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row relative z-10">
            <Button size="lg" class="font-medium transition-colors bg-white hover:bg-gray-100 text-primary-600">
              Start Free Trial <ArrowRight class="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" class="font-medium text-white transition-colors border-2 border-white hover:bg-white/20">
              Request Demo
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="w-full py-20 bg-secondary-50">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="mb-16 text-center">
          <Badge variant="outline" class="mb-4">Success Stories</Badge>
          <h2 class="mb-4 text-3xl font-bold font-display md:text-4xl text-secondary-950">
            Trusted by educational institutions worldwide
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-secondary-600">
            See how TimeTablePro has transformed scheduling processes for schools, colleges, and universities.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          {#each testimonials as testimonial}
            <Card class="p-6 transition-all duration-300 border hover:shadow-xl hover:border-primary-200 border-secondary-100">
              <div class="flex items-center gap-4 mb-4">
                <Avatar>
                  <div class="flex items-center justify-center w-10 h-10 text-lg rounded-full bg-primary-100">
                    {testimonial.avatar}
                  </div>
                </Avatar>
                <div>
                  <h3 class="font-semibold text-secondary-900">{testimonial.name}</h3>
                  <p class="text-sm text-secondary-600">{testimonial.role} • {testimonial.institution}</p>
                </div>
              </div>
              <p class="italic text-secondary-600 mb-3">"{testimonial.quote}"</p>
              <div class="text-amber-400 flex">
                {'★'.repeat(5)}
              </div>
            </Card>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="w-full py-12 bg-secondary-900 text-secondary-300">
    <div class="max-w-[1400px] mx-auto px-6">
      <div class="grid grid-cols-1 gap-12 mb-12 md:grid-cols-4">
        <div>
          <h3 class="mb-4 text-xl font-bold text-white">TimeTablePro</h3>
          <p class="mb-6 text-secondary-400">
            Intelligent timetabling solution for educational institutions of all sizes.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-secondary-400 hover:text-white transition-colors">
              <span class="sr-only">Twitter</span>
              <!-- Social Icon -->
            </a>
            <a href="#" class="text-secondary-400 hover:text-white transition-colors">
              <span class="sr-only">LinkedIn</span>
              <!-- Social Icon -->
            </a>
          </div>
        </div>
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-200">Product</h4>
          <ul class="space-y-2">
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Features</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Integrations</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Roadmap</a></li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-200">Resources</h4>
          <ul class="space-y-2">
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Knowledge Base</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Webinars</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-200">Company</h4>
          <ul class="space-y-2">
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">About</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" class="text-secondary-400 hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="pt-8 border-t border-secondary-800 text-center md:flex md:justify-between md:text-left">
        <p>© 2024 TimeTablePro. All rights reserved.</p>
        <div class="mt-4 space-x-6 md:mt-0">
          <a href="#" class="text-secondary-400 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="text-secondary-400 hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .max-w-\[1400px\] {
    width: 100%;
    max-width: 1400px;
  }
</style>


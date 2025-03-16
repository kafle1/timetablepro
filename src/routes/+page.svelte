<!-- Hero Section -->
<script lang="ts">
  import { ArrowRight, Calendar, Users, School, Bell, BarChart } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Avatar } from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { USER_ROLES } from '$lib/config';

  // Only redirect if the user is already logged in
  onMount(() => {
    if ($userStore && $userStore.user) {
      const role = $userStore.user.role;
      if (role === USER_ROLES.ADMIN) {
        goto('/admin/dashboard');
      } else if (role === USER_ROLES.TEACHER) {
        goto('/teacher/dashboard');
      } else if (role === USER_ROLES.STUDENT) {
        goto('/student/dashboard');
      }
    }
  });
</script>

<div class="flex flex-col min-h-screen bg-gradient-to-b from-primary-50 to-white">
  <!-- Navigation for Homepage -->
  <header class="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
    <nav class="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="text-2xl font-bold text-primary">TimetablePro</a>
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
    <section class="w-full py-20 md:py-32">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
          <div class="space-y-8">
            <h1 class="text-4xl font-bold leading-tight font-display md:text-5xl lg:text-6xl text-secondary-950">
              Simplify Scheduling, <span class="text-primary-600">Enhance Productivity!</span>
            </h1>
            <p class="text-lg md:text-xl text-secondary-600">
              Effortlessly manage school timetables with intelligent conflict resolution. Save time and reduce scheduling headaches.
            </p>
            <div class="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" class="font-medium text-white transition-colors bg-primary-600 hover:bg-primary-700">
                Get Started <ArrowRight class="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" class="font-medium transition-colors border-2 border-primary-600 text-primary-600 hover:bg-primary-50">
                Schedule Demo
              </Button>
            </div>
          </div>
          <div class="relative">
            <div class="absolute rounded-lg -inset-4 bg-gradient-to-r from-primary-200/20 to-accent-200/20 blur-3xl"></div>
            <img
              src="/hero-illustration.svg"
              alt="TimetablePro Illustration"
              class="relative w-full h-auto max-w-[600px] mx-auto"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="w-full py-20 bg-white">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="mb-16 text-center">
          <Badge variant="outline" class="mb-4">Features</Badge>
          <h2 class="mb-4 text-3xl font-bold font-display md:text-4xl text-secondary-950">
            Everything you need to manage schedules
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-secondary-600">
            Powerful features designed to make timetable management effortless and efficient.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {#each [
            {
              icon: Calendar,
              title: 'Intelligent Scheduling',
              description: 'Automatically resolves conflicts and optimizes timetables.'
            },
            {
              icon: Users,
              title: 'Resource Management',
              description: 'Efficiently manage teachers, rooms, and other resources.'
            },
            {
              icon: Bell,
              title: 'Real-Time Updates',
              description: 'Stay informed with instant notifications about changes.'
            },
            {
              icon: BarChart,
              title: 'Detailed Analytics',
              description: 'Track and optimize your scheduling efficiency.'
            }
          ] as feature}
            <Card class="p-6 transition-shadow duration-300 border hover:shadow-lg border-secondary-100">
              <div class="flex items-center justify-center w-12 h-12 p-3 mb-4 rounded-full bg-primary-100">
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
    <section class="w-full py-20 bg-secondary-50">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="mb-16 text-center">
          <Badge variant="outline" class="mb-4">For Everyone</Badge>
          <h2 class="mb-4 text-3xl font-bold font-display md:text-4xl text-secondary-950">
            Tailored for every role
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-secondary-600">
            Whether you're an administrator, teacher, or student, TimetablePro has features designed for you.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          {#each [
            {
              icon: School,
              role: 'Administrators',
              description: 'Manage schedules, resolve conflicts, and oversee resources with ease.'
            },
            {
              icon: Users,
              role: 'Teachers',
              description: 'View your schedule, update availability, and stay informed of changes.'
            },
            {
              icon: Calendar,
              role: 'Students',
              description: 'Access your class schedule anytime and receive instant updates.'
            }
          ] as role}
            <Card class="p-8 transition-shadow duration-300 border hover:shadow-lg border-secondary-100">
              <div class="flex items-center justify-center w-12 h-12 p-3 mb-4 rounded-full bg-accent-100">
                <svelte:component this={role.icon} class="w-6 h-6 text-accent-600" />
              </div>
              <h3 class="mb-2 text-xl font-semibold font-display text-secondary-900">
                {role.role}
              </h3>
              <p class="mb-4 text-secondary-600">
                {role.description}
              </p>
              <Button variant="outline" class="w-full border-secondary-200 hover:bg-secondary-50">
                Learn More <ArrowRight class="w-4 h-4 ml-2" />
              </Button>
            </Card>
          {/each}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="w-full py-20 bg-white">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="p-12 text-center bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl md:p-20">
          <h2 class="mb-6 text-3xl font-bold text-white font-display md:text-4xl">
            Ready to streamline your scheduling process?
          </h2>
          <p class="max-w-2xl mx-auto mb-8 text-lg text-primary-100">
            Join thousands of educational institutions that trust TimetablePro for their scheduling needs.
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" class="font-medium transition-colors bg-white hover:bg-gray-100 text-primary-600">
              Get Started <ArrowRight class="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" class="font-medium text-white transition-colors border-2 bg-primary-600 border-primary-600 hover:bg-white/20">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="w-full py-20 bg-secondary-50">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="mb-16 text-center">
          <Badge variant="outline" class="mb-4">Testimonials</Badge>
          <h2 class="mb-4 text-3xl font-bold font-display md:text-4xl text-secondary-950">
            Loved by educators worldwide
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-secondary-600">
            See what our users have to say about their experience with TimetablePro.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          {#each [
            {
              name: 'Sarah Johnson',
              role: 'School Principal',
              avatar: '👩‍🏫',
              quote: 'TimetablePro has revolutionized how we manage our school schedules. The time saved is incredible!'
            },
            {
              name: 'Michael Chen',
              role: 'Department Head',
              avatar: '👨‍🏫',
              quote: 'The conflict resolution feature alone has saved us countless hours of manual scheduling work.'
            },
            {
              name: 'Emily Brown',
              role: 'Teacher',
              avatar: '👩‍🏫',
              quote: 'I love how easy it is to view my schedule and manage my availability. Highly recommended!'
            }
          ] as testimonial}
            <Card class="p-6 transition-shadow duration-300 border hover:shadow-lg border-secondary-100">
              <div class="flex items-center gap-4 mb-4">
                <Avatar>
                  <div class="flex items-center justify-center w-10 h-10 text-lg rounded-full bg-primary-100">
                    {testimonial.avatar}
                  </div>
                </Avatar>
                <div>
                  <h3 class="font-semibold text-secondary-900">{testimonial.name}</h3>
                  <p class="text-sm text-secondary-600">{testimonial.role}</p>
                </div>
              </div>
              <p class="italic text-secondary-600">"{testimonial.quote}"</p>
            </Card>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="w-full py-8 bg-white border-t">
    <div class="max-w-[1400px] mx-auto px-6 text-center text-secondary-600">
      © 2024 TimetablePro. All rights reserved.
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

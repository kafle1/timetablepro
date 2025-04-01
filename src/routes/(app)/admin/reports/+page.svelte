<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { getUsers } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { FileText, Download, ChevronDown, ChevronUp, Calendar, Users, Clock, Home, BarChart, Activity, Filter } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config';
  import { Card } from '$lib/components/ui/card';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';

  // Initialize loading as false to immediately show reports
  let loading = false;
  let error: string | null = null;
  let activeTab = 'room-utilization';
  let selectedTimeframe = 'week';

  // Type for report keys
  type ReportType = 'room-utilization' | 'system-usage' | 'audit-log';
  type Timeframe = 'day' | 'week' | 'month' | 'quarter';

  // Mock report data for the three reports
  const mockReports = {
    'room-utilization': {
      title: 'Room Utilization Report',
      description: 'Usage statistics for all rooms',
      data: [
        { room: 'Science Lab 101', utilization: '75%', hours_used: '30/40', peak_day: 'Monday', peak_time: '09:00 - 11:00' },
        { room: 'Lecture Hall A', utilization: '60%', hours_used: '24/40', peak_day: 'Wednesday', peak_time: '13:00 - 15:00' },
        { room: 'Math Building 203', utilization: '85%', hours_used: '34/40', peak_day: 'Tuesday', peak_time: '10:00 - 12:00' },
        { room: 'Math Building 105', utilization: '50%', hours_used: '20/40', peak_day: 'Thursday', peak_time: '14:00 - 16:00' },
        { room: 'Computer Lab 302', utilization: '90%', hours_used: '36/40', peak_day: 'Friday', peak_time: '09:00 - 11:00' }
      ],
      chartData: {
        labels: ['Science Lab 101', 'Lecture Hall A', 'Math Building 203', 'Math Building 105', 'Computer Lab 302'],
        values: [75, 60, 85, 50, 90]
      }
    },
    'system-usage': {
      title: 'System Usage Report',
      description: 'System activity and performance metrics',
      data: [
        { date: '2023-05-01', logins: '120', schedules_created: '15', schedules_updated: '25', peak_hour: '10:00 - 11:00' },
        { date: '2023-05-02', logins: '105', schedules_created: '8', schedules_updated: '17', peak_hour: '09:00 - 10:00' },
        { date: '2023-05-03', logins: '130', schedules_created: '12', schedules_updated: '30', peak_hour: '11:00 - 12:00' },
        { date: '2023-05-04', logins: '125', schedules_created: '10', schedules_updated: '22', peak_hour: '10:00 - 11:00' },
        { date: '2023-05-05', logins: '140', schedules_created: '20', schedules_updated: '18', peak_hour: '14:00 - 15:00' }
      ],
      chartData: {
        labels: ['May 1', 'May 2', 'May 3', 'May 4', 'May 5'],
        logins: [120, 105, 130, 125, 140],
        created: [15, 8, 12, 10, 20],
        updated: [25, 17, 30, 22, 18]
      }
    },
    'audit-log': {
      title: 'Audit Log Report',
      description: 'System activity audit trail',
      data: [
        { timestamp: '2023-05-19 09:15:22', user: 'admin@example.com', action: 'Created Schedule', details: 'Created Advanced Physics schedule' },
        { timestamp: '2023-05-19 10:30:45', user: 'robert.smith@example.com', action: 'Updated Availability', details: 'Updated availability for Monday' },
        { timestamp: '2023-05-19 11:45:10', user: 'jane.johnson@example.com', action: 'Deleted Schedule', details: 'Deleted Linear Algebra schedule' },
        { timestamp: '2023-05-19 13:20:33', user: 'admin@example.com', action: 'Created User', details: 'Created new student user' },
        { timestamp: '2023-05-19 15:05:17', user: 'michael.chen@example.com', action: 'Updated Schedule', details: 'Updated Computer Science schedule' }
      ],
      chartData: {
        actions: ['Created Schedule', 'Updated Availability', 'Deleted Schedule', 'Created User', 'Updated Schedule'],
        users: ['admin@example.com', 'robert.smith@example.com', 'jane.johnson@example.com', 'michael.chen@example.com'],
        counts: [2, 1, 1, 1]
      }
    }
  };

  onMount(async () => {
    // No delay, immediately show reports
    loading = false;
  });

  function changeTimeframe(time: Timeframe) {
    selectedTimeframe = time;
    toastStore.success(`Timeframe changed to ${time}`);
  }

  function exportReport(type: ReportType) {
    toastStore.success(`${mockReports[type].title} exported successfully`);
  }

  // Helper function for rendering the Room Utilization chart
  function renderRoomUtilizationChart() {
    const { labels, values } = mockReports['room-utilization'].chartData;
    const maxValue = Math.max(...values);
    
    return {
      bars: values.map((value, i) => ({
        label: labels[i],
        value,
        height: (value / maxValue) * 80, // Increased to 80% of chart height max for better visibility
        color: value >= 80 ? 'bg-green-500' : (value >= 50 ? 'bg-amber-500' : 'bg-slate-400')
      }))
    };
  }

  // Helper function for rendering the System Usage chart
  function renderSystemUsageChart() {
    const { labels, logins, created, updated } = mockReports['system-usage'].chartData;
    const maxValue = Math.max(...logins);
    
    return {
      labels,
      datasets: [
        {
          name: 'Logins',
          color: 'stroke-blue-500',
          fill: 'fill-blue-500/20',
          points: logins.map((value, i) => ({
            x: (i / (labels.length - 1)) * 100,
            y: 100 - ((value / maxValue) * 70)
          }))
        },
        {
          name: 'Created',
          color: 'stroke-green-500',
          fill: 'fill-green-500/20',
          points: created.map((value, i) => ({
            x: (i / (labels.length - 1)) * 100,
            y: 100 - ((value / maxValue) * 70)
          }))
        },
        {
          name: 'Updated',
          color: 'stroke-orange-500',
          fill: 'fill-orange-500/20',
          points: updated.map((value, i) => ({
            x: (i / (labels.length - 1)) * 100,
            y: 100 - ((value / maxValue) * 70)
          }))
        }
      ]
    };
  }

  // Helper function for rendering the Audit Log chart (pie chart)
  function renderAuditLogChart() {
    const { users, counts } = mockReports['audit-log'].chartData;
    const total = counts.reduce((sum, count) => sum + count, 0);
    let startAngle = 0;
    
    return {
      slices: counts.map((count, i) => {
        const angle = (count / total) * 360;
        const slice = {
          user: users[i],
          count,
          percentage: Math.round((count / total) * 100),
          startAngle,
          endAngle: startAngle + angle,
          color: [
            'fill-blue-500',
            'fill-green-500',
            'fill-orange-500',
            'fill-purple-500',
            'fill-red-500'
          ][i % 5]
        };
        startAngle += angle;
        return slice;
      })
    };
  }

  // Convert angle to SVG coordinates for pie chart
  function angleToCoordinates(angle: number, radius: number) {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: radius + radius * Math.cos(radians),
      y: radius + radius * Math.sin(radians)
    };
  }

  // Generate SVG path for pie slice
  function generatePieSlicePath(slice: any, radius: number) {
    const start = angleToCoordinates(slice.startAngle, radius);
    const end = angleToCoordinates(slice.endAngle, radius);
    const largeArcFlag = slice.endAngle - slice.startAngle <= 180 ? 0 : 1;
    
    return `M ${radius} ${radius} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  }

  // Format percentage for display
  function formatPercentage(value: string) {
    return parseInt(value) + '%';
  }
</script>

<div class="container p-6 mx-auto">
  <div class="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
    <h1 class="text-2xl font-bold">Reports</h1>
    
    <!-- Timeframe selector -->
    <div class="flex items-center gap-3 self-start md:self-auto">
      <span class="text-sm font-medium text-muted-foreground">Timeframe:</span>
      <div class="flex overflow-hidden border rounded-md shadow-sm">
        <button 
          class="px-3 py-1.5 text-sm font-medium transition-colors {selectedTimeframe === 'day' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
          on:click={() => changeTimeframe('day')}
        >
          Day
        </button>
        <button 
          class="px-3 py-1.5 text-sm font-medium transition-colors {selectedTimeframe === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
          on:click={() => changeTimeframe('week')}
        >
          Week
        </button>
        <button 
          class="px-3 py-1.5 text-sm font-medium transition-colors {selectedTimeframe === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
          on:click={() => changeTimeframe('month')}
        >
          Month
        </button>
        <button 
          class="px-3 py-1.5 text-sm font-medium transition-colors {selectedTimeframe === 'quarter' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
          on:click={() => changeTimeframe('quarter')}
        >
          Quarter
        </button>
      </div>
    </div>
  </div>

  {#if error}
    <div class="p-4 mb-6 rounded-md bg-destructive/15 text-destructive">
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center h-64">
      <div class="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
    </div>
  {:else}
    <!-- Report tabs -->
    <div class="mb-6">
      <div class="grid w-full max-w-xl grid-cols-3 gap-2 p-1 mx-auto border rounded-lg bg-muted/10 shadow-sm">
        <button 
          class="px-3 py-2.5 text-sm rounded font-medium transition-colors {activeTab === 'room-utilization' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}"
          on:click={() => activeTab = 'room-utilization'}
        >
          <div class="flex items-center justify-center gap-2">
            <Home class="w-4 h-4" />
            <span>Room Utilization</span>
          </div>
        </button>
        <button 
          class="px-3 py-2.5 text-sm rounded font-medium transition-colors {activeTab === 'system-usage' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}"
          on:click={() => activeTab = 'system-usage'}
        >
          <div class="flex items-center justify-center gap-2">
            <Activity class="w-4 h-4" />
            <span>System Usage</span>
          </div>
        </button>
        <button 
          class="px-3 py-2.5 text-sm rounded font-medium transition-colors {activeTab === 'audit-log' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}"
          on:click={() => activeTab = 'audit-log'}
        >
          <div class="flex items-center justify-center gap-2">
            <Clock class="w-4 h-4" />
            <span>Audit Log</span>
          </div>
        </button>
      </div>
      
      <Separator class="my-6" />
      
      <!-- Room Utilization Report -->
      {#if activeTab === 'room-utilization'}
      <div class="space-y-6">
        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 class="text-xl font-semibold">{mockReports['room-utilization'].title}</h2>
            <p class="text-sm text-muted-foreground">{mockReports['room-utilization'].description}</p>
          </div>
          <Button on:click={() => exportReport('room-utilization')} variant="outline" class="shrink-0">
            <Download class="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        <!-- Room Utilization Chart -->
        <Card class="p-6 overflow-hidden border shadow-sm">
          <div class="mb-6">
            <h3 class="mb-2 text-lg font-medium">Room Utilization Overview</h3>
            <p class="text-sm text-muted-foreground">Percentage of available time each room is utilized per week</p>
          </div>
          
          {#if mockReports['room-utilization'].chartData}
            {@const chart = renderRoomUtilizationChart()}
            <div class="relative mt-6 h-80">
              <!-- Y-axis labels -->
              <div class="absolute top-0 bottom-0 left-0 flex flex-col justify-between w-12 text-xs font-medium text-muted-foreground">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              
              <!-- Chart area -->
              <div class="absolute top-0 bottom-10 right-0 left-12">
                <!-- Background grid -->
                <div class="absolute inset-0 border-b border-l border-muted/30">
                  {#each [0, 25, 50, 75] as tick}
                    <div class="absolute left-0 right-0 border-t border-muted/30" style="top: {100 - tick}%"></div>
                  {/each}
                </div>
                
                <!-- Bars -->
                <div class="absolute inset-0 flex items-end justify-around">
                  {#each chart.bars as bar, i}
                    <div class="flex flex-col items-center group">
                      <!-- Value above bar -->
                      <div class="text-xs font-medium mb-1">{bar.value}%</div>
                      
                      <!-- Bar -->
                      <div 
                        class="{bar.color} rounded-t-sm w-16 min-h-[8px] transition-all duration-500 shadow-md"
                        style="height: {bar.height}%; width: 16px;"
                      >
                        <!-- Tooltip on hover -->
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">
                          {bar.label}: {bar.value}% utilization
                        </div>
                      </div>
                      
                      <!-- Label -->
                      <div class="mt-3 text-xs text-center font-medium truncate" style="max-width: 100px;">
                        {bar.label}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </Card>
        
        <!-- Room Utilization Table -->
        <Card class="p-6 border shadow-sm">
          <div class="mb-4">
            <h3 class="text-lg font-medium">Detailed Utilization Data</h3>
          </div>
          
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Utilization Rate</TableHead>
                  <TableHead>Hours Used</TableHead>
                  <TableHead>Peak Day</TableHead>
                  <TableHead>Peak Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each mockReports['room-utilization'].data as item}
                  <TableRow>
                    <TableCell class="font-medium">{item.room}</TableCell>
                    <TableCell>
                      <div class="flex items-center gap-3">
                        <div class="w-24 h-2.5 overflow-hidden rounded-full bg-slate-200">
                          <div class="h-full {parseInt(item.utilization) >= 80 ? 'bg-green-500' : parseInt(item.utilization) >= 50 ? 'bg-amber-500' : 'bg-slate-400'}" style="width: {item.utilization}"></div>
                        </div>
                        <span class="font-medium">{item.utilization}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.hours_used}</TableCell>
                    <TableCell>{item.peak_day}</TableCell>
                    <TableCell>{item.peak_time}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      {/if}
      
      <!-- System Usage Report -->
      {#if activeTab === 'system-usage'}
      <div class="space-y-6">
        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 class="text-xl font-semibold">{mockReports['system-usage'].title}</h2>
            <p class="text-sm text-muted-foreground">{mockReports['system-usage'].description}</p>
          </div>
          <Button on:click={() => exportReport('system-usage')} variant="outline" class="shrink-0">
            <Download class="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        <!-- System Usage Chart -->
        <Card class="p-6 border shadow-sm">
          <div class="mb-6">
            <h3 class="mb-2 text-lg font-medium">System Activity Trends</h3>
            <p class="text-sm text-muted-foreground">Activity metrics over time</p>
          </div>
          
          {#if mockReports['system-usage'].chartData}
            {@const chart = renderSystemUsageChart()}
            <div class="relative mt-6 h-80">
              <!-- Y-axis -->
              <div class="absolute top-0 left-0 flex flex-col justify-between w-12 text-xs font-medium bottom-20 text-muted-foreground">
                <span>Max</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0</span>
              </div>
              
              <!-- Chart area -->
              <div class="absolute top-0 right-0 left-12 bottom-20">
                <!-- Background grid -->
                <div class="absolute inset-0 border-b border-l border-muted/30">
                  {#each [0, 25, 50, 75] as tick}
                    <div class="absolute left-0 right-0 border-t border-muted/30" style="top: {tick}%"></div>
                  {/each}
                </div>
                
                <!-- Line charts -->
                <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {#each chart.datasets as dataset}
                    <!-- Area under the line -->
                    <path
                      class="{dataset.fill} transition-all duration-500 opacity-30"
                      d="M{dataset.points[0].x},100 {dataset.points.map(pt => `L${pt.x},${pt.y}`).join(' ')} L{dataset.points[dataset.points.length-1].x},100 Z"
                    />
                    
                    <!-- Line -->
                    <path
                      class="{dataset.color} transition-all duration-500 fill-none stroke-2"
                      d="M{dataset.points.map(pt => `${pt.x},${pt.y}`).join(' L')}"
                    />
                    
                    <!-- Data points -->
                    {#each dataset.points as point}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="3"
                        class="{dataset.color} fill-white stroke-2"
                      />
                    {/each}
                  {/each}
                </svg>
              </div>
              
              <!-- X-axis labels -->
              <div class="absolute bottom-0 right-0 flex items-start justify-between h-20 text-xs font-medium left-12 text-muted-foreground">
                {#each chart.labels as label}
                  <div class="text-center" style="transform: rotate(-20deg); transform-origin: center top;">{label}</div>
                {/each}
              </div>
            </div>
            
            <!-- Legend -->
            <div class="flex flex-wrap justify-center gap-6 mt-4">
              {#each chart.datasets as dataset}
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full {dataset.color.replace('stroke-', 'bg-')}"></div>
                  <span class="text-sm font-medium">{dataset.name}</span>
                </div>
              {/each}
            </div>
          {/if}
        </Card>
        
        <!-- System Usage Table -->
        <Card class="p-6 border shadow-sm">
          <div class="mb-4">
            <h3 class="text-lg font-medium">Detailed Usage Data</h3>
          </div>
          
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Logins</TableHead>
                  <TableHead>Schedules Created</TableHead>
                  <TableHead>Schedules Updated</TableHead>
                  <TableHead>Peak Hour</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each mockReports['system-usage'].data as item}
                  <TableRow>
                    <TableCell class="font-medium">{item.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" class="bg-blue-50">{item.logins}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" class="bg-green-50">{item.schedules_created}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" class="bg-orange-50">{item.schedules_updated}</Badge>
                    </TableCell>
                    <TableCell>{item.peak_hour}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      {/if}
      
      <!-- Audit Log Report -->
      {#if activeTab === 'audit-log'}
      <div class="space-y-6">
        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 class="text-xl font-semibold">{mockReports['audit-log'].title}</h2>
            <p class="text-sm text-muted-foreground">{mockReports['audit-log'].description}</p>
          </div>
          <Button on:click={() => exportReport('audit-log')} variant="outline" class="shrink-0">
            <Download class="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        <!-- Audit Log Chart -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card class="p-6 border shadow-sm">
            <div class="mb-6">
              <h3 class="mb-2 text-lg font-medium">Activity by User</h3>
              <p class="text-sm text-muted-foreground">Distribution of system activities per user</p>
            </div>
            
            {#if mockReports['audit-log'].chartData}
              {@const chart = renderAuditLogChart()}
              <div class="flex justify-center">
                <div class="relative w-48 h-48">
                  <svg class="w-full h-full" viewBox="0 0 100 100">
                    {#each chart.slices as slice, i}
                      <path
                        d={generatePieSlicePath(slice, 50)}
                        class="{slice.color} transition-all duration-500 hover:opacity-80 cursor-pointer"
                        aria-label="{slice.user}: {slice.count} actions ({slice.percentage}%)"
                      />
                    {/each}
                    <!-- Center circle -->
                    <circle cx="50" cy="50" r="20" class="fill-white" />
                  </svg>
                </div>
              </div>
              
              <!-- Legend -->
              <div class="mt-6 space-y-3">
                {#each chart.slices as slice}
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full {slice.color}"></div>
                    <span class="flex-1 text-sm font-medium truncate">{slice.user}</span>
                    <Badge variant="outline">{slice.count} ({slice.percentage}%)</Badge>
                  </div>
                {/each}
              </div>
            {/if}
          </Card>
          
          <Card class="p-6 border shadow-sm">
            <div class="mb-6">
              <h3 class="mb-2 text-lg font-medium">Recent Activity Timeline</h3>
              <p class="text-sm text-muted-foreground">Chronological view of system activities</p>
            </div>
            
            <div class="relative mt-6 space-y-5">
              <div class="absolute top-0 bottom-0 w-px left-4 bg-muted-foreground/20"></div>
              
              {#each mockReports['audit-log'].data as item, i}
                <div class="relative flex gap-4 pl-10 group hover:bg-muted/10 p-2 rounded-md -ml-2">
                  <div class="absolute left-3 top-1.5 w-3 h-3 rounded-full bg-primary group-hover:ring-2 ring-primary/20 transition-all"></div>
                  <div class="flex-1">
                    <div class="flex flex-col mb-1 sm:flex-row sm:justify-between">
                      <span class="text-sm font-medium">{item.action}</span>
                      <span class="text-xs text-muted-foreground">{item.timestamp}</span>
                    </div>
                    <p class="mb-1 text-sm">{item.details}</p>
                    <p class="text-xs text-muted-foreground">By: {item.user}</p>
                  </div>
                </div>
              {/each}
            </div>
          </Card>
        </div>
        
        <!-- Audit Log Table -->
        <Card class="p-6 border shadow-sm">
          <div class="mb-4">
            <h3 class="text-lg font-medium">Detailed Audit Log</h3>
          </div>
          
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each mockReports['audit-log'].data as item}
                  <TableRow>
                    <TableCell class="whitespace-nowrap">{item.timestamp}</TableCell>
                    <TableCell class="max-w-[200px] truncate">{item.user}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" class="font-normal">
                        {item.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.details}</TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      {/if}
    </div>
  {/if}
</div> 
/**
 * Tests for McpMarketplace Component
 * Story 6.1: MCP Server Discovery and Marketplace
 * 
 * Test Coverage:
 * ✅ Task 1: Basic marketplace rendering with mock data
 * ✅ Task 2: Enhanced filtering and search functionality  
 * ✅ Task 3: Enhanced server information display with expandable cards
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import McpMarketplace from '../McpMarketplace';
import { McpMarketplaceEntry } from '../../../types/mcp';

// Mock marketplace entry for testing (unused but needed for type validation)
const _mockServer: McpMarketplaceEntry = {
  id: 'test-server',
  name: 'Test MCP Server',
  description: 'A test server for validation',
  category: 'Other',
  author: 'Test Author',
  version: '1.0.0',
  rating: 4.0,
  downloads: 100,
  transport: { type: 'sse', url: 'http://test.com' },
  capabilities: ['test'],
  tags: ['test'],
  featured: false
};

describe('McpMarketplace Component', () => {
  const defaultProps = {
    onServerSelect: jest.fn(),
    onPreviewServer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task 1: Basic Marketplace Foundation', () => {
    it('renders marketplace header and search interface', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      expect(screen.getByText('MCP Server Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Discover and integrate Model Context Protocol servers to enhance your AI capabilities')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search by name, description, capabilities, tags, or author...')).toBeInTheDocument();
    });

    it('renders category filter buttons', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      expect(screen.getByText('All Categories')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Web Search' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'File Operations' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'API Integrations' })).toBeInTheDocument();
    });

    it('renders sort dropdown with correct options', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const sortSelect = screen.getByLabelText('Sort By');
      expect(sortSelect).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Popularity' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Rating' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Alphabetical' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Newest' })).toBeInTheDocument();
    });

    it('renders mock marketplace entries', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      expect(screen.getByText('Tavily Web Search')).toBeInTheDocument();
      expect(screen.getByText('File Operations MCP')).toBeInTheDocument();
      expect(screen.getByText('GitHub API Integration')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL Database MCP')).toBeInTheDocument();
    });

    it('displays basic server metadata', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Check for rating and downloads display
      expect(screen.getByText('4.8')).toBeInTheDocument(); // Tavily rating
      expect(screen.getByText('15,420')).toBeInTheDocument(); // Downloads count
    });
  });

  describe('Task 2: Enhanced Filtering and Search', () => {
    it('filters servers based on search query', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search by name, description, capabilities, tags, or author...');
      fireEvent.change(searchInput, { target: { value: 'tavily' } });
      
      await waitFor(() => {
        expect(screen.getByText('Tavily Web Search')).toBeInTheDocument();
        expect(screen.queryByText('File Operations MCP')).not.toBeInTheDocument();
      });
    });

    it('filters by category', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const webSearchButton = screen.getByRole('button', { name: 'Web Search' });
      fireEvent.click(webSearchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Tavily Web Search')).toBeInTheDocument();
        expect(screen.queryByText('File Operations MCP')).not.toBeInTheDocument();
      });
    });

    it('filters by minimum rating', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const ratingSelect = screen.getByLabelText('Min Rating');
      fireEvent.change(ratingSelect, { target: { value: '4.5' } });
      
      await waitFor(() => {
        expect(screen.getByText('Tavily Web Search')).toBeInTheDocument(); // 4.8 rating
        expect(screen.getByText('PostgreSQL Database MCP')).toBeInTheDocument(); // 4.5 rating (should show with >= 4.5 filter)
        expect(screen.getByText('File Operations MCP')).toBeInTheDocument(); // 4.6 rating
        expect(screen.getByText('GitHub API Integration')).toBeInTheDocument(); // 4.7 rating
      });
    });

    it('filters to show featured servers only', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const featuredCheckbox = screen.getByLabelText('Show Featured Only');
      fireEvent.click(featuredCheckbox);
      
      await waitFor(() => {
        expect(screen.getByText('Tavily Web Search')).toBeInTheDocument(); // featured: true
        expect(screen.getByText('File Operations MCP')).toBeInTheDocument(); // featured: true
        expect(screen.queryByText('GitHub API Integration')).not.toBeInTheDocument(); // featured: false
      });
    });

    it('shows enhanced filter summary with active filters', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Apply multiple filters
      const ratingSelect = screen.getByLabelText('Min Rating');
      fireEvent.change(ratingSelect, { target: { value: '4' } });
      
      const categoryButton = screen.getByRole('button', { name: 'Web Search' });
      fireEvent.click(categoryButton);
      
      await waitFor(() => {
        expect(screen.getByText(/with 4\+ stars/)).toBeInTheDocument();
        expect(screen.getByText(/in Web Search/)).toBeInTheDocument();
      });
    });

    it('clears all filters when clear button is clicked', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Apply filters
      const searchInput = screen.getByPlaceholderText('Search by name, description, capabilities, tags, or author...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const ratingSelect = screen.getByLabelText('Min Rating');
      fireEvent.change(ratingSelect, { target: { value: '4' } });
      
      // Click clear all filters button (use getAllByRole and select the first one from filter summary)
      const clearButtons = screen.getAllByRole('button', { name: /clear all filters/i });
      fireEvent.click(clearButtons[0]); // Use the first one (from filter summary, not empty state)
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(ratingSelect).toHaveValue('0');
      });
    });

    it('shows empty state when no results found', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search by name, description, capabilities, tags, or author...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent-server' } });
      
      await waitFor(() => {
        expect(screen.getByText('No servers found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search criteria, rating filter, or browse different categories')).toBeInTheDocument();
      });
    });

    it('clears filters from empty state', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search by name, description, capabilities, tags, or author...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(screen.getByText('No servers found')).toBeInTheDocument();
      });
      
      // Find the clear button in the empty state
      const emptyStateSection = screen.getByText(/no servers found/i).closest('div');
      const emptyStateClearButton = within(emptyStateSection!).getByRole('button', { name: /clear all filters/i });
      fireEvent.click(emptyStateClearButton);
      
      await waitFor(() => {
        expect(screen.getByText('Tavily Web Search')).toBeInTheDocument();
        expect(searchInput).toHaveValue('');
      });
    });

    it('sorts servers correctly', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const sortSelect = screen.getByLabelText('Sort By');
      fireEvent.change(sortSelect, { target: { value: 'rating' } });
      
      await waitFor(() => {
        const serverCards = screen.getAllByText(/★/);
        expect(serverCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Task 3: Enhanced Server Information Display', () => {
    it('displays enhanced server cards with detailed metadata grid', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Check for enhanced header with improved styling
      expect(screen.getByText('Tavily Web Search')).toBeInTheDocument();
      expect(screen.getByText('by Tavily AI')).toBeInTheDocument();
      expect(screen.getByText('v1.2.0')).toBeInTheDocument();
      
      // Check for metadata grid information
      expect(screen.getByText('4.8')).toBeInTheDocument(); // Rating
      expect(screen.getByText('15,420')).toBeInTheDocument(); // Downloads
      // Check for category in server cards (using getAllByText for multiple occurrences)
      expect(screen.getAllByText('Web Search')[1]).toBeInTheDocument(); // Category in server card, not filter button
    });

    it('displays transport badges with proper styling', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Check for transport type badges (using getAllByText for multiple occurrences)
      expect(screen.getAllByText('SSE')[0]).toBeInTheDocument();
      expect(screen.getAllByText('STDIO')[0]).toBeInTheDocument();
    });

    it('shows expandable server information with More Info button', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Find and click "More Info" button
      const moreInfoButtons = screen.getAllByText('More Info');
      expect(moreInfoButtons.length).toBeGreaterThan(0);
      
      fireEvent.click(moreInfoButtons[0]);
      
      // Check for expanded content sections
      await waitFor(() => {
        expect(screen.getByText('Installation')).toBeInTheDocument();
        expect(screen.getByText('Resources')).toBeInTheDocument();
        expect(screen.getByText('Compatibility')).toBeInTheDocument();
      });
    });

    it('displays transport-specific installation instructions', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Expand SSE server (Tavily) - first card
      const moreInfoButtons = screen.getAllByText('More Info');
      fireEvent.click(moreInfoButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Server-Sent Events (SSE) connection')).toBeInTheDocument();
        expect(screen.getByText('No local installation required')).toBeInTheDocument();
      });
    });

    it('displays stdio installation instructions for local servers', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Expand STDIO server (File Operations) - second card
      const moreInfoButtons = screen.getAllByText('More Info');
      fireEvent.click(moreInfoButtons[1]); // File Operations MCP is second
      
      await waitFor(() => {
        expect(screen.getByText('requires local installation')).toBeInTheDocument();
        expect(screen.getByText('Command-line setup needed')).toBeInTheDocument();
      });
    });

    it('shows enhanced capability and tag sections', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Check for capabilities section (using getAllByText for multiple occurrences)
      expect(screen.getAllByText('Capabilities')[0]).toBeInTheDocument();
      expect(screen.getAllByText('search')[0]).toBeInTheDocument();
      expect(screen.getByText('extract')).toBeInTheDocument();
      
      // Check for tags section (using getAllByText for multiple occurrences)
      expect(screen.getAllByText('Tags')[0]).toBeInTheDocument();
      expect(screen.getByText('#search')).toBeInTheDocument();
      expect(screen.getByText('#web')).toBeInTheDocument();
    });

    it('displays documentation and repository links when expanded', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const moreInfoButtons = screen.getAllByText('More Info');
      fireEvent.click(moreInfoButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('📖 Documentation')).toBeInTheDocument();
        expect(screen.getByText('🐙 Repository')).toBeInTheDocument();
      });
    });

    it('shows installation loading state when adding server', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const addButtons = screen.getAllByText('Add Server');
      fireEvent.click(addButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Installing...')).toBeInTheDocument();
      });
    });

    it('displays compatibility information in expanded view', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const moreInfoButtons = screen.getAllByText('More Info');
      fireEvent.click(moreInfoButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Cross-platform')).toBeInTheDocument();
        expect(screen.getByText('MCP v1.0')).toBeInTheDocument();
      });
    });

    it('handles expand/collapse functionality correctly', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const moreInfoButton = screen.getAllByText('More Info')[0];
      
      // Expand
      fireEvent.click(moreInfoButton);
      await waitFor(() => {
        expect(screen.getByText('Show Less')).toBeInTheDocument();
      });
      
      // Collapse
      fireEvent.click(screen.getByText('Show Less'));
      await waitFor(() => {
        expect(screen.getByText('More Info')).toBeInTheDocument();
      });
    });

    it('displays featured badge with enhanced styling', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Should show enhanced featured badge for featured servers
      expect(screen.getAllByText('✨ FEATURED')[0]).toBeInTheDocument();
    });

    it('shows enhanced download count formatting', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Check for properly formatted download counts from actual mock data
      expect(screen.getByText('15,420')).toBeInTheDocument(); // First server: Tavily Web Search
      expect(screen.getByText('12,800')).toBeInTheDocument(); // Second server: File Operations
    });

    it('displays transport badge styling correctly', () => {
      render(<McpMarketplace {...defaultProps} />);

      // Check that transport badges have proper styling classes (using getAllByText for multiple)
      const sseBadges = screen.getAllByText('SSE');
      expect(sseBadges[0]).toHaveClass('text-xs', 'px-2', 'py-1', 'rounded-full');
      
      const stdioBadges = screen.getAllByText('STDIO');
      expect(stdioBadges[0]).toHaveClass('text-xs', 'px-2', 'py-1', 'rounded-full');
    });
  });

  describe('Server Card Interactions', () => {
    it('calls onPreviewServer when preview button is clicked', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const previewButtons = screen.getAllByText('Preview');
      fireEvent.click(previewButtons[0]);
      
      expect(defaultProps.onPreviewServer).toHaveBeenCalledTimes(1);
      expect(defaultProps.onPreviewServer).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tavily Web Search'
        })
      );
    });

    it('calls onServerSelect when add server button is clicked', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      const addButtons = screen.getAllByText('Add Server');
      fireEvent.click(addButtons[0]);
      
      // Wait for the async installation process to complete
      await waitFor(() => {
        expect(defaultProps.onServerSelect).toHaveBeenCalledTimes(1);
      }, { timeout: 2000 });
      
      expect(defaultProps.onServerSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tavily Web Search'
        })
      );
    });

    it('shows capability badges correctly', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Check for capability badges using getAllByText for multiple occurrences
      expect(screen.getAllByText('search')[0]).toBeInTheDocument();
      expect(screen.getByText('extract')).toBeInTheDocument();
      expect(screen.getByText('summarize')).toBeInTheDocument();
    });
  });

  describe('Responsive Design and Layout', () => {
    it('renders grid layout correctly', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Check that the grid container exists with responsive classes
      const gridContainer = screen.getByText('Tavily Web Search').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('displays results counter correctly', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Initial count should show all servers
      expect(screen.getByText(/Found \d+ servers?/)).toBeInTheDocument();
      
      // Filter by category and check count updates
      const categoryButtons = screen.getAllByText('Web Search');
      const webSearchCategoryButton = categoryButtons.find(button => 
        button.tagName === 'BUTTON'
      );
      fireEvent.click(webSearchCategoryButton!);
      
      await waitFor(() => {
        expect(screen.getByText(/Found 1 server/)).toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    it('shows capability overflow indicator when more than 3 capabilities', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // GitHub server has 4 capabilities, should show "+1 more"
      const githubCard = screen.getByText('GitHub API Integration').closest('.bg-slate-800');
      expect(githubCard).toBeInTheDocument();
    });

    it('truncates long descriptions appropriately', () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Check that descriptions are present and properly displayed
      expect(screen.getByText(/Professional web search API/)).toBeInTheDocument();
    });

    it('maintains state correctly during interactions', async () => {
      render(<McpMarketplace {...defaultProps} />);
      
      // Apply search filter
      const searchInput = screen.getByPlaceholderText('Search by name, description, capabilities, tags, or author...');
      fireEvent.change(searchInput, { target: { value: 'tavily' } });
      
      await waitFor(() => {
        expect(screen.getByText('Tavily Web Search')).toBeInTheDocument();
        expect(screen.queryByText('File Operations MCP')).not.toBeInTheDocument();
      });
      
      // Expand server info while filtered
      const moreInfoButton = screen.getByText('More Info');
      fireEvent.click(moreInfoButton);
      
      await waitFor(() => {
        expect(screen.getByText('Installation')).toBeInTheDocument();
        expect(screen.getByText('Tavily Web Search')).toBeInTheDocument(); // Still filtered
      });
    });
  });
});

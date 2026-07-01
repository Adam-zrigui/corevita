# CoreVita - Enterprise DICOM Medical Imaging Platform

<div align="center">
  <img src="https://images.unsplash.com/photo-1579154347045-3f7d6a4a2b5d?auto=format&fit=crop&w=800&h=400&q=80" alt="Medical Imaging" width="800"/>
</div>

CoreVita is a comprehensive enterprise-grade medical imaging platform for handling DICOM (Digital Imaging and Communications in Medicine) studies. Built with Next.js 16, it provides a full-stack solution for hospitals and clinics to manage, view, and analyze medical imaging studies.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📋 Overview

CoreVita streamlines medical imaging workflows with:
- **DICOM Study Management**: Upload, organize, and analyze medical imaging studies
- **Advanced Viewer**: Full-featured DICOM image viewer with measurements and annotations
- **Role-Based Access**: Secure team management with granular permissions
- **Subscription Billing**: Flexible pricing plans with Stripe integration
- **Real-time Analytics**: Usage metrics and study statistics
- **Collaboration Tools**: Study sharing and team workflows

## 🎨 Features

### Core Functionality
- **Study Upload & Processing**: Batch DICOM upload with automatic metadata extraction
- **Medical Imaging Viewer**: Comprehensive DICOM viewer with measurements, annotations, and multi-modal support
- **Patient Management**: Detailed patient records and study history
- **Report Generation**: AI-powered report creation with structured outputs
- **Team Collaboration**: Role-based access and shared study workflows

### Administrative Features
- **Usage Analytics**: Real-time dashboard with usage metrics and trends
- **Team Management**: User management, role assignment, and permissions
- **Billing & Subscriptions**: Stripe integration with flexible pricing tiers
- **Audit Logging**: Complete activity tracking and compliance reporting
- **System Administration**: Tenant management and system-wide controls

## 🛠 Technical Architecture

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript + React 19
- **Styling**: Tailwind CSS with component-based architecture
- **State Management**: Client Server Components with Suspense boundaries
- **Icons**: Lucide React for medical UI icons

### Backend
- **Database**: PostgreSQL with Prisma ORM (Type 7)
- **Caching**: Redis with SCAN optimization
- **File Storage**: AWS S3 for DICOM files
- **Authentication**: Firebase Authentication (previously @neondatabase/auth)
- **Message Queue**: BullMQ for background processing
- **Payments**: Stripe Integration

### Key Dependencies
- **Medical Libraries**: CornerstoneJS, dicom-parser, dcmjs
- **Security**: bcryptjs, Zod validation
- **Real-time**: Redis for session and data caching
- **Build Tools**: Vite for testing, ESLint for code quality

## 📁 Project Structure

```
src/
├── app/                    # Next.js routes
│   ├── (app)/             # Protected application routes
│   │   ├── dashboard/     # Main dashboard with stats and analytics
│   │   ├── upload/        # DICOM upload interface
│   │   ├── viewer/        # Medical imaging viewer
│   │   └── ...other/      # Other protected pages
│   ├── (auth)/             # Authentication routes
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── ...other/      # Other auth pages
│   ├── (marketing)/        # Public marketing pages
│   │   ├── pricing/       # Pricing page
│   │   ├── services/      # Service pages
│   │   └── ...other/      # Marketing content
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       ├── billing/       # Payment endpoints
│       ├── studies/       # Study management API
│       └── upload/        # Upload API
├── components/            # Reusable UI components
│   ├── dashboard/         # Dashboard components
│   ├── ui/               # Base UI components
│   └── ...other/         # Other components
├── lib/                   # Application libraries
│   ├── auth              # Authentication logic
│   ├── db                # Database utilities
│   ├── storage           # File storage services
│   ├── redis             # Redis client
│   └── ...other/         # Other utilities
└── ...other directories   # Remaining project files
```

## 🏥 Medical Features

### DICOM Processing
- **Multi-file Upload**: Support for DICOMDIR and individual files
- **Metadata Extraction**: Automatic parsing of patient, study, and series information
- **Instance Management**: Organize DICOM instances by series and modality
- **Validation**: DICOM standard compliance checking

### Medical Imaging Viewer
- **Multi-modal Support**: CT, MRI, Ultrasound, X-ray, etc.
- **Measurement Tools**: Distance, angle, and area measurements
- **Window Level/Width**: Adjustable image contrast settings
- **Annotations**: Freehand drawing and structured annotations
- **Export**: High-quality image export for reports

### Clinical Workflows
- **Study Prioritization**: Automatic sorting by urgency and modality
- **Status Tracking**: Pending → Reading → Reported workflow
- **Team Collaboration**: Shared study access and annotations
- **Report Integration**: Seamless integration with clinical reports

## 💳 Pricing & Billing

### Subscription Tiers
- **Starter**: €99/month - 1 user, 500 studies
- **Pro**: €299/month - 5 users, unlimited studies
- **Enterprise**: Custom pricing - Unlimited users, on-prem options

### Billing Features
- **Stripe Integration**: Secure payment processing
- **Usage-based Billing**: Track study counts and compute resources
- **Usage Alerts**: Automatic notifications for threshold alerts
- **Invoice Generation**: Detailed billing reports
- **Payment Methods**: Credit cards, ACH, and international payment support

## 🔐 Security & Compliance

### Authentication & Authorization
- **Firebase Auth**: OAuth 2.0 with Google and password-based authentication
- **Role-Based Access**: Admin, doctor, radiologist, and staff roles
- **Session Management**: Secure JWT-based authentication
- **Rate Limiting**: Protection against abuse and overuse
- **Data Encryption**: AES-256 encryption for stored data

### Compliance Features
- **HIPAA Compliance**: Built-in compliance for healthcare data
- **Audit Trails**: Complete logging of all system activities
- **Data Retention**: Configurable data retention policies
- **Access Controls**: Granular permission management
- **Security Headers**: OWASP Top 10 protection

## 📊 Analytics & Monitoring

### Dashboard Analytics
- **Usage Metrics**: Real-time study count and user statistics
- **Performance Monitoring**: System health and response times
- **User Analytics**: Authentication patterns and feature usage
- **Error Tracking**: Comprehensive error logging and reporting
- **Capacity Planning**: Resource usage forecasting

### Business Intelligence
- **Study Distribution**: Breakdown by modality, patient demographics
- **Team Productivity**: Individual and team performance metrics
- **Revenue Tracking**: Subscription revenue and usage-based charges
- **System Performance**: Uptime, response times, and error rates
- **Custom Reports**: Export capabilities for external analysis

## 🚀 Deployment & Scaling

### Production Deployment
- **Docker Support**: Containerized deployment for consistency
- **Environment Configuration**: .env files for different environments
- **CI/CD Integration**: GitHub Actions for automated testing and deployment
- **Load Balancing**: Support for horizontal scaling
- **Monitoring**: Prometheus/Grafana integration (planned)

### Scalability Features
- **Database Optimization**: Composite indexing for query performance
- **Caching Strategy**: Redis for session and data caching
- **CDN Integration**: Static asset delivery via CDN
- **Background Processing**: BullMQ for heavy computations
- **Auto-scaling**: Resource adjustment based on demand

## 📚 Documentation

### API Reference
- **RESTful API**: Comprehensive API documentation for all endpoints
- **WebSocket Support**: Real-time updates and notifications
- **Error Handling**: Standardized error responses and codes
- **Authentication**: API key management and token-based security

### Development Guide
- **Component Patterns**: Atomic design methodology
- **Testing Strategy**: Unit, integration, and end-to-end testing
- **Code Standards**: ESLint, Prettier, and TypeScript guidelines
- **Deployment Procedures**: Multi-environment deployment guides

### Architectural Decisions
- **Technology Choices**: Why specific technologies were selected
- **Design Patterns**: Component architecture and state management
- **Performance Optimizations**: Lazy loading, caching, and streaming
- **Security Considerations**: Threat modeling and mitigation strategies

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Lint code: `pnpm lint`
6. Commit with conventional commits
7. Push to branch
8. Open a pull request

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User workflow validation
- **Performance Tests**: Load and stress testing
- **Accessibility Testing**: WCAG compliance validation

### Code Quality
- **Type Safety**: 100% TypeScript coverage
- **Linting**: ESLint with Next.js and React rules
- **Code Formatting**: Prettier for consistent styling
- **Type Checking**: Strict TypeScript configuration
- **Documentation**: JSDoc and README updates

## 🌟 Future Roadmap

### Phase 1: Core Features (Completed)
- [x] DICOM upload and processing
- [x] Medical imaging viewer
- [x] User authentication
- [x] Basic dashboard analytics

### Phase 2: Advanced Features
- [ ] AI-powered report generation
- [ ] Multi-modal imaging integration
- [ ] Advanced measurement tools
- [ ] Telemedicine capabilities

### Phase 3: Enterprise Features
- [ ] HL7 integration
- [ ] DICOMweb protocols
- [ ] Cloud-native deployment
- [ ] Advanced analytics and ML

## 📞 Support & Community

### Getting Help
- **Documentation**: [Documentation](./docs/)
- **GitHub Issues**: [Report Issues](https://github.com/your-org/corevita/issues)
- **Discussions**: [Community Forum](https://github.com/your-org/corevita/discussions)
- **Slack/Discord**: [Community Chat](https://join.slack.com/t/your-workspace/invite/your-invite-link)

### Contributing
- **Code of Conduct**: Please respect our [Code of Conduct](./CODE_OF_CONDUCT.md)
- **Contributing Guide**: [Contribution Guidelines](./CONTRIBUTING.md)
- **License**: [MIT License](./LICENSE)

## 🎯 Acknowledgements

Special thanks to the open-source community and all contributors who have made this project possible. This project builds upon many excellent open-source libraries and frameworks.

## 📧 Contact

For questions, suggestions, or partnership opportunities, please reach out at:
- **Email**: contact@corevita.com
- **GitHub**: [github.com/your-org/corevita](https://github.com/your-org/corevita)
- **Website**: [corevita.com](https://corevita.com)

---

*This README was generated on 2026-07-01 and reflects the current state of the CoreVita project. The project is actively maintained and continuously improved based on user feedback and clinical needs.*

### Project Status

This is a work in progress - the CoreVita platform is under active development and continuously improved based on user feedback and clinical requirements.
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET() {
    try {
        const healthData = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: env.NODE_ENV,
            services: {
                api: 'healthy',
                chat: 'healthy',
                personas: 'healthy',
            },
            version: process.env.npm_package_version || '1.0.0',
        }

        return NextResponse.json({
            success: true,
            data: healthData,
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Health check failed',
            data: {
                status: 'ERROR',
                timestamp: new Date().toISOString(),
            },
        }, { status: 500 })
    }
} 
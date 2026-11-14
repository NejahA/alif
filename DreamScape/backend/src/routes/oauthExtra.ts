import { Router } from 'express';
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import prisma from '../prisma';
import { generateToken } from '../auth';

const router = Router();

// ---------- Twitter ----------
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY!,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
      callbackURL: '/api/auth/extra/twitter/callback',
      includeEmail: true,
    },
    async (_, __, profile, done) => {
      const email = (profile.emails?.[0]?.value) || `${profile.username}@twitter.com`;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({ data: { email, password: '' } });
      }
      await prisma.oAuthProvider.create({
        data: { userId: user.id, provider: 'twitter', providerId: profile.id },
      });
      return done(null, user);
    },
  ),
);

// ---------- GitHub ----------
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: '/api/auth/extra/github/callback',
      scope: ['user:email'],
    },
    async (_, __, profile, done) => {
      const email = (profile.emails?.[0]?.value) || `${profile.username}@github.com`;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({ data: { email, password: '' } });
      }
      await prisma.oAuthProvider.create({
        data: { userId: user.id, provider: 'github', providerId: profile.id },
      });
      return done(null, user);
    },
  ),
);

// ---------- LinkedIn ----------
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      callbackURL: '/api/auth/extra/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    async (_, __, profile, done) => {
      const email = (profile.emails?.[0]?.value) || `${profile.id}@linkedin.com`;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({ data: { email, password: '' } });
      }
      await prisma.oAuthProvider.create({
        data: { userId: user.id, provider: 'linkedin', providerId: profile.id },
      });
      return done(null, user);
    },
  ),
);

// Twitter routes
router.get('/twitter', passport.authenticate('twitter'));
router.get(
  '/twitter/callback',
  passport.authenticate('twitter', { session: false }),
  (req, res) => {
    const token = generateToken((req.user as any).id);
    res.json({ token });
  },
);

// GitHub routes
router.get('/github', passport.authenticate('github'));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = generateToken((req.user as any).id);
    res.json({ token });
  },
);

// LinkedIn routes
router.get('/linkedin', passport.authenticate('linkedin'));
router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  (req, res) => {
    const token = generateToken((req.user as any).id);
    res.json({ token });
  },
);

export default router;

